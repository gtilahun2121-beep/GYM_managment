import { Expose } from 'class-transformer';

export class MemberResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  gymId: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  gender: string;

  @Expose()
  emergencyContactName: string;

  @Expose()
  emergencyContactPhone: string;

  @Expose()
  healthNotes: string;

  @Expose()
  fitnessGoals: string[];

  @Expose()
  qrCodeHash: string;

  @Expose()
  referralCode: string;

  @Expose()
  membershipStartDate: Date;

  @Expose()
  membershipEndDate: Date;

  @Expose()
  totalCheckIns: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class MemberProfileResponseDto extends MemberResponseDto {
  @Expose()
  currentSubscription: {
    id: string;
    planName: string;
    status: string;
    startDate: Date;
    endDate: Date;
    price: number;
  };

  @Expose()
  familyMembers?: MemberResponseDto[];

  @Expose()
  referralStats: {
    totalReferrals: number;
    activeReferrals: number;
    referralRewards: number;
  };
}

export class MemberSearchResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  membershipStatus: string;

  @Expose()
  qrCodeHash: string;

  @Expose()
  totalCheckIns: number;

  @Expose()
  joinDate: Date;
}

export class ReferralStatsDto {
  @Expose()
  memberId: string;

  @Expose()
  referralCode: string;

  @Expose()
  totalReferrals: number;

  @Expose()
  activeReferrals: number;

  @Expose()
  referrals: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    joinDate: Date;
    status: string;
  }>;

  @Expose()
  estimatedRewards: number;
}
