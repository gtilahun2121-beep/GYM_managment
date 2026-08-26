import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, IsNull, Not, In } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { MemberEntity } from '../entities/member.entity';
import { MembershipSubscriptionEntity } from '../entities/membership-subscription.entity';
import { MembershipPlanEntity } from '../entities/membership-plan.entity';
import { CreateMemberDto, UpdateMemberDto, ReferralStatsDto } from '../dto';
import { SubscriptionStatus } from '@gym/shared-types';

@Injectable()
export class MembersService {
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    @InjectRepository(MemberEntity)
    private membersRepository: Repository<MemberEntity>,
    @InjectRepository(MembershipSubscriptionEntity)
    private subscriptionsRepository: Repository<MembershipSubscriptionEntity>,
    @InjectRepository(MembershipPlanEntity)
    private plansRepository: Repository<MembershipPlanEntity>
  ) {}

  /**
   * Get all members with pagination and filtering
   */
  async findAll(
    gymId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: 'active' | 'inactive' | 'paused';
      search?: string;
      membershipPlanId?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const query = this.membersRepository.createQueryBuilder('member')
      .where('member.gymId = :gymId', { gymId })
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .orderBy('member.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (filters?.status) {
      if (filters.status === 'active') {
        query.andWhere('subscriptions.status = :status', { status: 'active' });
      } else if (filters.status === 'inactive') {
        query.andWhere('subscriptions.status = :status', { status: 'inactive' });
      }
    }

    if (filters?.search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.membershipPlanId) {
      query.andWhere('plan.id = :planId', { planId: filters.membershipPlanId });
    }

    const [members, total] = await query.getManyAndCount();

    return {
      data: members,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get member by ID with full profile
   */
  async findById(memberId: string, gymId: string) {
    const member = await this.membersRepository.findOne({
      where: { id: memberId, gymId },
      relations: [
        'user',
        'subscriptions',
        'subscriptions.plan',
        'referrer',
        'bookings',
        'checkIns',
        'progressLogs',
        'workoutPlans'
      ]
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  /**
   * Get member by QR code hash
   */
  async findByQrCode(qrCodeHash: string, gymId: string) {
    const member = await this.membersRepository.findOne({
      where: { qrCodeHash, gymId },
      relations: ['user', 'subscriptions', 'subscriptions.plan']
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  /**
   * Get member by referral code
   */
  async findByReferralCode(referralCode: string) {
    const member = await this.membersRepository.findOne({
      where: { referralCode },
      relations: ['user', 'gym']
    });

    if (!member) {
      throw new NotFoundException('Invalid referral code');
    }

    return member;
  }

  /**
   * Search members by various criteria
   */
  async search(
    gymId: string,
    query: string,
    filters?: {
      status?: string;
      joinDateFrom?: Date;
      joinDateTo?: Date;
      membershipPlanId?: string;
    }
  ) {
    const searchQuery = this.membersRepository.createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.plan', 'plan')
      .where('member.gymId = :gymId', { gymId })
      .andWhere(
        '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query OR member.referralCode ILIKE :query)',
        { query: `%${query}%` }
      );

    if (filters?.status) {
      searchQuery.andWhere('subscriptions.status = :status', {
        status: filters.status
      });
    }

    if (filters?.joinDateFrom || filters?.joinDateTo) {
      searchQuery.andWhere('member.membershipStartDate BETWEEN :from AND :to', {
        from: filters.joinDateFrom || new Date('1970-01-01'),
        to: filters.joinDateTo || new Date()
      });
    }

    if (filters?.membershipPlanId) {
      searchQuery.andWhere('plan.id = :planId', {
        planId: filters.membershipPlanId
      });
    }

    return searchQuery.getMany();
  }

  /**
   * Create a new member
   */
  async create(gymId: string, createMemberDto: CreateMemberDto) {
    // Validate referral code if provided
    let referredBy: string | null = null;
    if (createMemberDto.referredByCode) {
      const referrer = await this.findByReferralCode(
        createMemberDto.referredByCode
      );
      if (referrer.gymId !== gymId) {
        throw new BadRequestException('Invalid referral code for this gym');
      }
      referredBy = referrer.id;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      createMemberDto.password,
      this.BCRYPT_ROUNDS
    );

    // Check if email already exists
    const existingUser = await this.membersRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .where('user.email = :email AND member.gymId = :gymId', {
        email: createMemberDto.email,
        gymId
      })
      .getOne();

    if (existingUser) {
      throw new ConflictException('Email already registered for this gym');
    }

    // Generate unique referral code and QR code hash
    const referralCode = this.generateReferralCode();
    const qrCodeHash = this.generateQrCodeHash();

    // Get membership plan
    const plan = await this.plansRepository.findOne({
      where: { id: createMemberDto.membershipPlanId, gymId }
    });

    if (!plan) {
      throw new NotFoundException('Membership plan not found');
    }

    // Calculate subscription dates based on billing frequency
    const membershipStartDate = new Date();
    const membershipEndDate = new Date();

    // Map billing frequency to days
    const frequencyToDays: Record<string, number> = {
      'monthly': 30,
      'quarterly': 90,
      'annual': 365,
      'one-time': 30
    };

    const durationDays = frequencyToDays[plan.billingFrequency] || 30;
    membershipEndDate.setDate(membershipEndDate.getDate() + durationDays);

    // Create member
    const member = this.membersRepository.create({
      gymId,
      userId: '', // Will be set after user creation in UserService
      dateOfBirth: createMemberDto.dateOfBirth,
      gender: createMemberDto.gender,
      emergencyContactName: createMemberDto.emergencyContactName,
      emergencyContactPhone: createMemberDto.emergencyContactPhone,
      healthNotes: createMemberDto.healthNotes,
      fitnessGoals: createMemberDto.fitnessGoals || [],
      referralCode,
      qrCodeHash,
      referredBy,
      membershipStartDate,
      membershipEndDate,
      totalCheckIns: 0
    });

    await this.membersRepository.save(member);

    // Create initial subscription
    const subscription = this.subscriptionsRepository.create({
      memberId: member.id,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: membershipStartDate,
      endDate: membershipEndDate,
      autoRenew: true
    });

    await this.subscriptionsRepository.save(subscription);

    return this.findById(member.id, gymId);
  }

  /**
   * Update member profile
   */
  async update(
    memberId: string,
    gymId: string,
    updateMemberDto: UpdateMemberDto
  ) {
    const member = await this.findById(memberId, gymId);

    // Update allowed fields
    if (updateMemberDto.firstName !== undefined) {
      member.user.firstName = updateMemberDto.firstName;
    }
    if (updateMemberDto.lastName !== undefined) {
      member.user.lastName = updateMemberDto.lastName;
    }
    if (updateMemberDto.email !== undefined) {
      member.user.email = updateMemberDto.email;
    }
    if (updateMemberDto.dateOfBirth !== undefined) {
      member.dateOfBirth = updateMemberDto.dateOfBirth;
    }
    if (updateMemberDto.gender !== undefined) {
      member.gender = updateMemberDto.gender;
    }
    if (updateMemberDto.emergencyContactName !== undefined) {
      member.emergencyContactName = updateMemberDto.emergencyContactName;
    }
    if (updateMemberDto.emergencyContactPhone !== undefined) {
      member.emergencyContactPhone = updateMemberDto.emergencyContactPhone;
    }
    if (updateMemberDto.healthNotes !== undefined) {
      member.healthNotes = updateMemberDto.healthNotes;
    }
    if (updateMemberDto.fitnessGoals !== undefined) {
      member.fitnessGoals = updateMemberDto.fitnessGoals;
    }

    await this.membersRepository.save(member);
    return this.findById(memberId, gymId);
  }

  /**
   * Delete a member
   */
  async delete(memberId: string, gymId: string) {
    const member = await this.findById(memberId, gymId);

    await this.membersRepository.remove(member);

    return { success: true, message: 'Member deleted successfully' };
  }

  /**
   * Suspend a member's membership
   */
  async suspendMembership(memberId: string, gymId: string, reason: string) {
    const member = await this.findById(memberId, gymId);

    // Find active subscription
    const activeSubscription = member.subscriptions.find(
      (sub) => sub.status === 'active'
    );

    if (!activeSubscription) {
      throw new BadRequestException('No active subscription to suspend');
    }

    activeSubscription.status = SubscriptionStatus.FROZEN;

    await this.subscriptionsRepository.save(activeSubscription);

    return activeSubscription;
  }

  /**
   * Resume a suspended membership
   */
  async resumeMembership(memberId: string, gymId: string) {
    const member = await this.findById(memberId, gymId);

    const suspendedSubscription = member.subscriptions.find(
      (sub) => sub.status === SubscriptionStatus.FROZEN
    );

    if (!suspendedSubscription) {
      throw new BadRequestException('No suspended subscription to resume');
    }

    suspendedSubscription.status = SubscriptionStatus.ACTIVE;

    await this.subscriptionsRepository.save(suspendedSubscription);

    return suspendedSubscription;
  }

  /**
   * Get referral statistics for a member
   */
  async getReferralStats(memberId: string, gymId: string): Promise<ReferralStatsDto> {
    const member = await this.findById(memberId, gymId);

    // Find all members referred by this member
    const referrals = await this.membersRepository.find({
      where: { referredBy: memberId, gymId },
      relations: ['user', 'subscriptions']
    });

    // Count active referrals
    const activeReferrals = referrals.filter((referral) =>
      referral.subscriptions.some((sub) => sub.status === 'active')
    ).length;

    // Calculate estimated rewards (e.g., $10 per active referral)
    const estimatedRewards = activeReferrals * 10;

    return {
      memberId,
      referralCode: member.referralCode,
      totalReferrals: referrals.length,
      activeReferrals,
      referrals: referrals.map((ref) => ({
        id: ref.id,
        firstName: ref.user.firstName,
        lastName: ref.user.lastName,
        email: ref.user.email,
        joinDate: ref.membershipStartDate,
        status: ref.subscriptions[0]?.status || 'inactive'
      })),
      estimatedRewards
    };
  }

  /**
   * Link a family member to a primary member
   */
  async linkFamilyMember(
    primaryMemberId: string,
    familyMemberId: string,
    gymId: string
  ) {
    const primaryMember = await this.findById(primaryMemberId, gymId);
    const familyMember = await this.findById(familyMemberId, gymId);

    if (familyMember.userId === primaryMember.userId) {
      throw new BadRequestException('Cannot link a member to themselves');
    }

    // Store family relationship in metadata
    primaryMember.metadata = {
      ...(primaryMember.metadata || {}),
      familyMembers: [
        ...(primaryMember.metadata?.familyMembers || []),
        familyMemberId
      ]
    };

    familyMember.metadata = {
      ...(familyMember.metadata || {}),
      familyParent: primaryMemberId
    };

    await this.membersRepository.save([primaryMember, familyMember]);

    return {
      primaryMemberId,
      familyMemberId,
      message: 'Family member linked successfully'
    };
  }

  /**
   * Unlink a family member
   */
  async unlinkFamilyMember(
    primaryMemberId: string,
    familyMemberId: string,
    gymId: string
  ) {
    const primaryMember = await this.findById(primaryMemberId, gymId);

    const familyMembers = primaryMember.metadata?.familyMembers || [];
    const index = familyMembers.indexOf(familyMemberId);

    if (index === -1) {
      throw new BadRequestException('Family member not linked to this member');
    }

    familyMembers.splice(index, 1);
    primaryMember.metadata = {
      ...(primaryMember.metadata || {}),
      familyMembers
    };

    await this.membersRepository.save(primaryMember);

    return {
      primaryMemberId,
      familyMemberId,
      message: 'Family member unlinked successfully'
    };
  }

  /**
   * Get family members of a primary member
   */
  async getFamilyMembers(primaryMemberId: string, gymId: string) {
    const primaryMember = await this.findById(primaryMemberId, gymId);

    const familyMemberIds = primaryMember.metadata?.familyMembers || [];

    if (familyMemberIds.length === 0) {
      return [];
    }

    const familyMembers = await this.membersRepository.find({
      where: { id: In(familyMemberIds), gymId },
      relations: ['user', 'subscriptions', 'subscriptions.plan']
    });

    return familyMembers;
  }

  /**
   * Generate a unique referral code
   */
  private generateReferralCode(): string {
    return crypto
      .randomBytes(6)
      .toString('hex')
      .toUpperCase()
      .substring(0, 8);
  }

  /**
   * Generate a unique QR code hash
   */
  private generateQrCodeHash(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Track member check-in count (called by CheckInsService)
   */
  async incrementCheckInCount(memberId: string) {
    await this.membersRepository.increment(
      { id: memberId },
      'totalCheckIns',
      1
    );
  }

  /**
   * Get member activity stats
   */
  async getActivityStats(memberId: string, gymId: string) {
    const member = await this.findById(memberId, gymId);

    const bookingCount = member.bookings?.length || 0;
    const checkInCount = member.totalCheckIns;
    const workoutPlanCount = member.workoutPlans?.length || 0;

    const lastCheckIn = member.checkIns?.sort(
      (a, b) => b.checkInTime.getTime() - a.checkInTime.getTime()
    )[0];

    return {
      memberId,
      totalBookings: bookingCount,
      totalCheckIns: checkInCount,
      totalWorkoutPlans: workoutPlanCount,
      lastCheckIn: lastCheckIn?.checkInTime || null,
      isActive: checkInCount > 0,
      activityLevel: this.calculateActivityLevel(checkInCount, bookingCount)
    };
  }

  /**
   * Calculate activity level based on check-ins and bookings
   */
  private calculateActivityLevel(
    checkInCount: number,
    bookingCount: number
  ): 'high' | 'medium' | 'low' | 'inactive' {
    const score = checkInCount * 2 + bookingCount;

    if (score >= 30) return 'high';
    if (score >= 10) return 'medium';
    if (score > 0) return 'low';
    return 'inactive';
  }
}
