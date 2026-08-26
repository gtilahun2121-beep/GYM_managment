/**
 * Members Module - Usage Examples
 * This file demonstrates how to use the MembersService and MembersController
 * in various scenarios.
 */

// ============================================================================
// EXAMPLE 1: Create a New Member
// ============================================================================

/**
 * Create a basic member without referral code
 */
const createBasicMember = async (membersService: any, gymId: string) => {
  const createDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass123!', // Must match validation: uppercase+lowercase+digit+special
    dateOfBirth: new Date('1990-01-15'),
    gender: 'Male',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '555-1234',
    healthNotes: 'No health issues',
    fitnessGoals: ['Weight loss', 'Strength training'],
    membershipPlanId: 'uuid-of-plan'
  };

  const member = await membersService.create(gymId, createDto);
  console.log('Created member:', member.id, member.referralCode);
  // Output: referralCode can be shared for recruitment
};

/**
 * Create a member using a referral code (referred member)
 */
const createReferredMember = async (membersService: any, gymId: string) => {
  const referrerCode = 'ABC12345'; // Existing member's referral code

  const createDto = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'SecurePass456!',
    membershipPlanId: 'uuid-of-plan',
    referredByCode: referrerCode // Track referral
  };

  const member = await membersService.create(gymId, createDto);
  console.log('Created referred member:', member.id, member.referredBy);
};

// ============================================================================
// EXAMPLE 2: Get Member Information
// ============================================================================

/**
 * Get member profile by ID
 */
const getMemberProfile = async (membersService: any, memberId: string, gymId: string) => {
  const member = await membersService.findById(memberId, gymId);

  console.log('Member Profile:');
  console.log(`- Name: ${member.user.firstName} ${member.user.lastName}`);
  console.log(`- Email: ${member.user.email}`);
  console.log(`- Member Since: ${member.membershipStartDate}`);
  console.log(`- Total Check-ins: ${member.totalCheckIns}`);
  console.log(`- Referral Code: ${member.referralCode}`);
};

/**
 * Get member by QR code (for check-in)
 */
const getMemberForCheckIn = async (membersService: any, qrCodeHash: string, gymId: string) => {
  const member = await membersService.findByQrCode(qrCodeHash, gymId);

  console.log('Member for Check-in:');
  console.log(`- Name: ${member.user.firstName} ${member.user.lastName}`);
  console.log(`- Active Membership: ${member.subscriptions.some((s) => s.status === 'active')}`);
};

// ============================================================================
// EXAMPLE 3: Referral System
// ============================================================================

/**
 * Get referral statistics for a member
 */
const getReferralStats = async (membersService: any, memberId: string, gymId: string) => {
  const stats = await membersService.getReferralStats(memberId, gymId);

  console.log('Referral Statistics:');
  console.log(`- Referral Code: ${stats.referralCode}`);
  console.log(`- Total Referrals: ${stats.totalReferrals}`);
  console.log(`- Active Referrals: ${stats.activeReferrals}`);
  console.log(`- Estimated Rewards: $${stats.estimatedRewards}`);
  console.log('- Referral List:');

  stats.referrals.forEach((ref) => {
    console.log(
      `  - ${ref.firstName} ${ref.lastName} (${ref.email}) - Status: ${ref.status}`
    );
  });
};

// ============================================================================
// EXAMPLE 4: Family Accounts
// ============================================================================

/**
 * Link a family member
 */
const linkFamilyMember = async (
  membersService: any,
  parentMemberId: string,
  childMemberId: string,
  gymId: string
) => {
  const result = await membersService.linkFamilyMember(
    parentMemberId,
    childMemberId,
    gymId
  );

  console.log('Family Link Created:');
  console.log(`- Parent: ${parentMemberId}`);
  console.log(`- Child: ${childMemberId}`);
};

/**
 * Get all family members
 */
const getFamilyMembers = async (
  membersService: any,
  parentMemberId: string,
  gymId: string
) => {
  const familyMembers = await membersService.getFamilyMembers(parentMemberId, gymId);

  console.log(`Family Members (${familyMembers.length}):`);
  familyMembers.forEach((member) => {
    console.log(
      `- ${member.user.firstName} ${member.user.lastName} (${member.user.email})`
    );
  });
};

/**
 * Unlink family member
 */
const unlinkFamilyMember = async (
  membersService: any,
  parentMemberId: string,
  childMemberId: string,
  gymId: string
) => {
  const result = await membersService.unlinkFamilyMember(
    parentMemberId,
    childMemberId,
    gymId
  );

  console.log('Family Link Removed:', result.message);
};

// ============================================================================
// EXAMPLE 5: Update Member Profile
// ============================================================================

/**
 * Update member information
 */
const updateMemberProfile = async (
  membersService: any,
  memberId: string,
  gymId: string
) => {
  const updateDto = {
    firstName: 'Jonathan', // Update first name
    healthNotes: 'Updated health information',
    fitnessGoals: ['Cardio', 'Flexibility', 'Strength'] // Add new goals
  };

  const updated = await membersService.update(memberId, gymId, updateDto);

  console.log('Member Updated:');
  console.log(`- Name: ${updated.user.firstName} ${updated.user.lastName}`);
  console.log(`- Updated At: ${updated.updatedAt}`);
};

// ============================================================================
// EXAMPLE 6: Membership Management
// ============================================================================

/**
 * Suspend a membership
 */
const suspendMembership = async (
  membersService: any,
  memberId: string,
  gymId: string
) => {
  const subscription = await membersService.suspendMembership(
    memberId,
    gymId,
    'Non-payment'
  );

  console.log('Membership Suspended:');
  console.log(`- Status: ${subscription.status}`);
  console.log(`- Suspension Reason: Non-payment`);
  console.log(`- Suspended At: ${subscription.metadata.suspendedAt}`);
};

/**
 * Resume a membership
 */
const resumeMembership = async (
  membersService: any,
  memberId: string,
  gymId: string
) => {
  const subscription = await membersService.resumeMembership(memberId, gymId);

  console.log('Membership Resumed:');
  console.log(`- Status: ${subscription.status}`);
  console.log(`- Resumed At: ${subscription.metadata.resumedAt}`);
};

// ============================================================================
// EXAMPLE 7: Search and List
// ============================================================================

/**
 * Search members by various criteria
 */
const searchMembers = async (membersService: any, gymId: string) => {
  // Search by name
  const byName = await membersService.search(gymId, 'John');
  console.log('Search by name (John):', byName.length, 'results');

  // Search by email
  const byEmail = await membersService.search(gymId, 'john@example.com');
  console.log('Search by email:', byEmail.length, 'results');

  // Search with filters
  const activeMembers = await membersService.search(gymId, '', {
    status: 'active',
    joinDateFrom: new Date('2024-01-01'),
    joinDateTo: new Date('2024-12-31')
  });
  console.log('Active members (2024):', activeMembers.length);
};

/**
 * Get paginated member list
 */
const getPagedMembers = async (membersService: any, gymId: string) => {
  const result = await membersService.findAll(
    gymId,
    1, // page
    20, // limit
    { status: 'active' }
  );

  console.log(`Members (Page 1):`);
  console.log(`- Total: ${result.pagination.total}`);
  console.log(`- Pages: ${result.pagination.pages}`);
  console.log(`- Current: ${result.data.length} members`);

  result.data.forEach((member) => {
    console.log(`  - ${member.user.firstName} ${member.user.lastName}`);
  });
};

// ============================================================================
// EXAMPLE 8: Activity Tracking
// ============================================================================

/**
 * Get member activity statistics
 */
const getActivityStats = async (
  membersService: any,
  memberId: string,
  gymId: string
) => {
  const stats = await membersService.getActivityStats(memberId, gymId);

  console.log('Member Activity:');
  console.log(`- Total Bookings: ${stats.totalBookings}`);
  console.log(`- Total Check-ins: ${stats.totalCheckIns}`);
  console.log(`- Total Workout Plans: ${stats.totalWorkoutPlans}`);
  console.log(`- Last Check-in: ${stats.lastCheckIn}`);
  console.log(`- Is Active: ${stats.isActive}`);
  console.log(`- Activity Level: ${stats.activityLevel}`);
};

// ============================================================================
// EXAMPLE 9: Delete Member
// ============================================================================

/**
 * Delete a member (cascades to related records)
 */
const deleteMember = async (
  membersService: any,
  memberId: string,
  gymId: string
) => {
  const result = await membersService.delete(memberId, gymId);

  console.log('Member Deleted:', result.message);
  // Note: Cascading deletion handles:
  // - Bookings (soft delete)
  // - Subscriptions (soft delete)
  // - Check-ins (soft delete)
  // - Referral relationships
};

// ============================================================================
// EXAMPLE 10: Controller Endpoint Patterns
// ============================================================================

/**
 * Example request/response for POST /members (Create)
 */
const createMemberControllerExample = {
  request: {
    method: 'POST',
    endpoint: '/members',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      'Content-Type': 'application/json'
    },
    body: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      membershipPlanId: 'uuid-of-plan'
    }
  },
  response: {
    status: 201,
    body: {
      success: true,
      data: {
        id: 'member-uuid',
        userId: 'user-uuid',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        referralCode: 'ABC12345',
        qrCodeHash: 'hash...',
        membershipStartDate: '2024-01-15',
        totalCheckIns: 0
      },
      message: 'Member created successfully'
    }
  }
};

/**
 * Example request/response for GET /members (List)
 */
const listMembersControllerExample = {
  request: {
    method: 'GET',
    endpoint: '/members?page=1&limit=20&status=active&search=john',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  },
  response: {
    status: 200,
    body: {
      success: true,
      data: [
        {
          id: 'member-uuid-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          totalCheckIns: 45
        }
      ],
      pagination: {
        total: 100,
        page: 1,
        limit: 20,
        pages: 5
      }
    }
  }
};

/**
 * Example request/response for GET /members/:id/referrals
 */
const getReferralsControllerExample = {
  request: {
    method: 'GET',
    endpoint: '/members/member-uuid/referrals',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  },
  response: {
    status: 200,
    body: {
      success: true,
      data: {
        memberId: 'member-uuid',
        referralCode: 'ABC12345',
        totalReferrals: 5,
        activeReferrals: 3,
        referrals: [
          {
            id: 'referred-member-uuid',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            joinDate: '2024-02-01',
            status: 'active'
          }
        ],
        estimatedRewards: 30
      }
    }
  }
};

export {
  createBasicMember,
  createReferredMember,
  getMemberProfile,
  getMemberForCheckIn,
  getReferralStats,
  linkFamilyMember,
  getFamilyMembers,
  unlinkFamilyMember,
  updateMemberProfile,
  suspendMembership,
  resumeMembership,
  searchMembers,
  getPagedMembers,
  getActivityStats,
  deleteMember,
  createMemberControllerExample,
  listMembersControllerExample,
  getReferralsControllerExample
};
