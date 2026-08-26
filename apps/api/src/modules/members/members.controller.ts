import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MembersService } from './services/members.service';
import { UserRole } from '@gym/shared-types';
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberResponseDto,
  MemberProfileResponseDto,
  ReferralStatsDto
} from './dto';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private membersService: MembersService) {}

  /**
   * GET /members
   * Get all members (pagination, filtering)
   * Requires: gym_manager, receptionist, trainer
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_MANAGER, UserRole.RECEPTIONIST, UserRole.TRAINER)
  async getAllMembers(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: 'active' | 'inactive' | 'paused',
    @Query('search') search?: string,
    @Query('membershipPlanId') membershipPlanId?: string
  ) {
    const gymId = user.gymId;

    const result = await this.membersService.findAll(gymId, parseInt(page), parseInt(limit), {
      status,
      search,
      membershipPlanId
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  /**
   * GET /members/search
   * Search members by query and filters
   * Requires: gym_manager, receptionist, trainer
   */
  @Get('search')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_MANAGER, UserRole.RECEPTIONIST, UserRole.TRAINER)
  async searchMembers(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('status') status?: string,
    @Query('joinDateFrom') joinDateFrom?: string,
    @Query('joinDateTo') joinDateTo?: string,
    @Query('membershipPlanId') membershipPlanId?: string
  ) {
    if (!query || query.length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    const result = await this.membersService.search(user.gymId, query, {
      status,
      joinDateFrom: joinDateFrom ? new Date(joinDateFrom) : undefined,
      joinDateTo: joinDateTo ? new Date(joinDateTo) : undefined,
      membershipPlanId
    });

    return {
      success: true,
      data: result
    };
  }

  /**
   * GET /members/qr/:qrCodeHash
   * Get member by QR code (for check-in)
   * Requires: receptionist, trainer, member
   */
  @Get('qr/:qrCodeHash')
  async getMemberByQrCode(
    @CurrentUser() user: any,
    @Param('qrCodeHash') qrCodeHash: string
  ) {
    const member = await this.membersService.findByQrCode(
      qrCodeHash,
      user.gymId
    );

    return {
      success: true,
      data: member
    };
  }

  /**
   * GET /members/:id
   * Get member profile by ID
   * Requires: self, gym_manager, receptionist, trainer
   */
  @Get(':id')
  async getMemberProfile(
    @CurrentUser() user: any,
    @Param('id') memberId: string
  ) {
    // Check authorization - member can view own profile, staff can view any
    if (
      user.role === 'member' &&
      user.memberId !== memberId
    ) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const member = await this.membersService.findById(memberId, user.gymId);

    return {
      success: true,
      data: member
    };
  }

  /**
   * GET /members/:id/referrals
   * Get referral statistics for a member
   * Requires: self or gym_manager
   */
  @Get(':id/referrals')
  async getMemberReferrals(
    @CurrentUser() user: any,
    @Param('id') memberId: string
  ) {
    // Authorization
    if (
      user.role === 'member' &&
      user.memberId !== memberId
    ) {
      throw new ForbiddenException('You can only view your own referrals');
    }

    const referralStats = await this.membersService.getReferralStats(
      memberId,
      user.gymId
    );

    return {
      success: true,
      data: referralStats
    };
  }

  /**
   * GET /members/:id/family
   * Get family members linked to a member
   * Requires: self or gym_manager
   */
  @Get(':id/family')
  async getFamilyMembers(
    @CurrentUser() user: any,
    @Param('id') memberId: string
  ) {
    // Authorization
    if (
      user.role === 'member' &&
      user.memberId !== memberId
    ) {
      throw new ForbiddenException('You can only view your own family members');
    }

    const familyMembers = await this.membersService.getFamilyMembers(
      memberId,
      user.gymId
    );

    return {
      success: true,
      data: familyMembers
    };
  }

  /**
   * GET /members/:id/activity
   * Get member activity statistics
   * Requires: self or gym_manager
   */
  @Get(':id/activity')
  async getMemberActivity(
    @CurrentUser() user: any,
    @Param('id') memberId: string
  ) {
    // Authorization
    if (
      user.role === 'member' &&
      user.memberId !== memberId
    ) {
      throw new ForbiddenException('You can only view your own activity');
    }

    const activityStats = await this.membersService.getActivityStats(
      memberId,
      user.gymId
    );

    return {
      success: true,
      data: activityStats
    };
  }

  /**
   * POST /members
   * Create a new member
   * Requires: gym_manager, receptionist
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_MANAGER, UserRole.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  async createMember(
    @CurrentUser() user: any,
    @Body() createMemberDto: CreateMemberDto
  ) {
    const member = await this.membersService.create(user.gymId, createMemberDto);

    return {
      success: true,
      data: member,
      message: 'Member created successfully'
    };
  }

  /**
   * POST /members/:id/family
   * Link a family member
   * Requires: member or gym_manager
   */
  @Post(':id/family')
  async linkFamilyMember(
    @CurrentUser() user: any,
    @Param('id') primaryMemberId: string,
    @Body('familyMemberId') familyMemberId: string
  ) {
    // Authorization
    if (
      user.role === 'member' &&
      user.memberId !== primaryMemberId
    ) {
      throw new ForbiddenException('You can only manage your own family');
    }

    const result = await this.membersService.linkFamilyMember(
      primaryMemberId,
      familyMemberId,
      user.gymId
    );

    return {
      success: true,
      data: result
    };
  }

  /**
   * PUT /members/:id
   * Update member profile
   * Requires: self or gym_manager
   */
  @Put(':id')
  async updateMember(
    @CurrentUser() user: any,
    @Param('id') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto
  ) {
    // Authorization
    if (
      user.role === 'member' &&
      user.memberId !== memberId
    ) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const member = await this.membersService.update(
      memberId,
      user.gymId,
      updateMemberDto
    );

    return {
      success: true,
      data: member,
      message: 'Member updated successfully'
    };
  }

  /**
   * PUT /members/:id/suspend
   * Suspend membership
   * Requires: gym_manager, receptionist
   */
  @Put(':id/suspend')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_MANAGER, UserRole.RECEPTIONIST)
  async suspendMembership(
    @CurrentUser() user: any,
    @Param('id') memberId: string,
    @Body('reason') reason: string
  ) {
    const subscription = await this.membersService.suspendMembership(
      memberId,
      user.gymId,
      reason
    );

    return {
      success: true,
      data: subscription,
      message: 'Membership suspended successfully'
    };
  }

  /**
   * PUT /members/:id/resume
   * Resume suspended membership
   * Requires: gym_manager, receptionist
   */
  @Put(':id/resume')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_MANAGER, UserRole.RECEPTIONIST)
  async resumeMembership(
    @CurrentUser() user: any,
    @Param('id') memberId: string
  ) {
    const subscription = await this.membersService.resumeMembership(
      memberId,
      user.gymId
    );

    return {
      success: true,
      data: subscription,
      message: 'Membership resumed successfully'
    };
  }

  /**
   * DELETE /members/:id/family/:familyMemberId
   * Unlink a family member
   * Requires: member or gym_manager
   */
  @Delete(':id/family/:familyMemberId')
  async unlinkFamilyMember(
    @CurrentUser() user: any,
    @Param('id') primaryMemberId: string,
    @Param('familyMemberId') familyMemberId: string
  ) {
    // Authorization
    if (
      user.role === 'member' &&
      user.memberId !== primaryMemberId
    ) {
      throw new ForbiddenException('You can only manage your own family');
    }

    const result = await this.membersService.unlinkFamilyMember(
      primaryMemberId,
      familyMemberId,
      user.gymId
    );

    return {
      success: true,
      data: result
    };
  }

  /**
   * DELETE /members/:id
   * Delete a member
   * Requires: gym_manager
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_MANAGER)
  async deleteMember(
    @CurrentUser() user: any,
    @Param('id') memberId: string
  ) {
    const result = await this.membersService.delete(memberId, user.gymId);

    return {
      success: true,
      data: result,
      message: 'Member deleted successfully'
    };
  }
}
