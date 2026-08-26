# Member Management Module

## Overview

The Member Management module handles all member-related operations including CRUD operations, profile management, family account linking, referral tracking, and activity monitoring. This module is core to gym operations and supports multi-tenant isolation through `gymId`.

## Architecture

### Directory Structure

```
apps/api/src/modules/members/
├── entities/
│   ├── member.entity.ts
│   ├── membership-plan.entity.ts
│   └── membership-subscription.entity.ts
├── services/
│   └── members.service.ts
├── dto/
│   ├── create-member.dto.ts
│   ├── update-member.dto.ts
│   ├── member-response.dto.ts
│   └── index.ts
├── members.controller.ts
└── members.module.ts
```

## Entity Schema

### MemberEntity

```sql
Table: members
Columns:
  - id (UUID, PK)
  - userId (UUID, FK → users)
  - gymId (UUID, FK → gyms) [TENANT KEY]
  - dateOfBirth (Date, nullable)
  - gender (VARCHAR 20, nullable)
  - emergencyContactName (VARCHAR 100, nullable)
  - emergencyContactPhone (VARCHAR 30, nullable)
  - healthNotes (TEXT, nullable)
  - fitnessGoals (JSONB array, default [])
  - qrCodeHash (VARCHAR 255, unique)
  - referralCode (VARCHAR 20, unique)
  - referredBy (UUID, FK → members, nullable)
  - membershipStartDate (Date)
  - membershipEndDate (Date, nullable)
  - totalCheckIns (Integer, default 0)
  - metadata (JSONB, default {})
  - createdAt (TimestampTZ)
  - updatedAt (TimestampTZ)

Indexes:
  - idx_members_gym (gymId)
  - idx_members_qr (qrCodeHash, unique)
  - idx_members_referral (referralCode, unique)

Relations:
  - user (ManyToOne → UserEntity)
  - gym (ManyToOne → GymEntity)
  - referrer (ManyToOne → MemberEntity)
  - bookings (OneToMany → BookingEntity)
  - checkIns (OneToMany → CheckInEntity)
  - subscriptions (OneToMany → MembershipSubscriptionEntity)
  - progressLogs (OneToMany → MemberProgressEntity)
  - workoutPlans (OneToMany → WorkoutPlanEntity)
```

### MembershipPlanEntity

```sql
Table: membership_plans
Columns:
  - id (UUID, PK)
  - gymId (UUID, FK → gyms)
  - name (VARCHAR 255)
  - description (TEXT, nullable)
  - price (Decimal)
  - durationDays (Integer)
  - maxClassesPerWeek (Integer, nullable)
  - hasPersonalTraining (Boolean)
  - createdAt (TimestampTZ)
  - updatedAt (TimestampTZ)
```

### MembershipSubscriptionEntity

```sql
Table: membership_subscriptions
Columns:
  - id (UUID, PK)
  - memberId (UUID, FK → members)
  - planId (UUID, FK → membership_plans)
  - status (VARCHAR, enum: active/inactive/paused)
  - startDate (Date)
  - endDate (Date)
  - autoRenew (Boolean)
  - price (Decimal)
  - metadata (JSONB, default {})
  - createdAt (TimestampTZ)
  - updatedAt (TimestampTZ)
```

## API Endpoints

### Get All Members (Paginated)

```
GET /members
Query Parameters:
  - page (number, default: 1)
  - limit (number, default: 20)
  - status (enum: active/inactive/paused, optional)
  - search (string, optional)
  - membershipPlanId (UUID, optional)

Response: 200 OK
{
  "success": true,
  "data": [MemberEntity, ...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}

Access Control:
  - Roles: super_admin, gym_manager, receptionist, trainer
  - Multi-tenant: Returns only members of user's gym
```

### Search Members

```
GET /members/search
Query Parameters:
  - q (string, min 2 chars, required)
  - status (string, optional)
  - joinDateFrom (ISO Date, optional)
  - joinDateTo (ISO Date, optional)
  - membershipPlanId (UUID, optional)

Response: 200 OK
{
  "success": true,
  "data": [MemberEntity, ...]
}

Searches across:
  - First name (case-insensitive)
  - Last name (case-insensitive)
  - Email (case-insensitive)
  - Referral code (case-insensitive)
```

### Get Member by QR Code (Check-in)

```
GET /members/qr/:qrCodeHash

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "qrCodeHash": "hash...",
    "subscriptions": [{
      "id": "uuid",
      "planName": "Gold",
      "status": "active",
      "endDate": "2024-12-31",
      "price": 99.99
    }],
    ...
  }
}

Errors:
  - 404 Not Found: Member not found
```

### Get Member Profile

```
GET /members/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "555-1234",
    "healthNotes": "...",
    "fitnessGoals": ["Weight loss", "Strength"],
    "qrCodeHash": "hash...",
    "referralCode": "ABC12345",
    "membershipStartDate": "2024-01-01",
    "membershipEndDate": "2024-12-31",
    "totalCheckIns": 45,
    "subscriptions": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}

Authorization:
  - Members can only view their own profile
  - Staff can view any member's profile in their gym
```

### Get Member Referral Statistics

```
GET /members/:id/referrals

Response: 200 OK
{
  "success": true,
  "data": {
    "memberId": "uuid",
    "referralCode": "ABC12345",
    "totalReferrals": 5,
    "activeReferrals": 3,
    "referrals": [
      {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "joinDate": "2024-02-01",
        "status": "active"
      },
      ...
    ],
    "estimatedRewards": 30
  }
}

Reward Calculation:
  - $10 per active referral
  - Active = membership status is 'active'
```

### Get Family Members

```
GET /members/:id/family

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Child",
      "lastName": "Doe",
      "email": "child@example.com",
      "subscriptions": [...],
      ...
    }
  ]
}

Authorization:
  - Members can only view their own family
  - Staff can view any member's family in their gym
```

### Get Member Activity Statistics

```
GET /members/:id/activity

Response: 200 OK
{
  "success": true,
  "data": {
    "memberId": "uuid",
    "totalBookings": 25,
    "totalCheckIns": 45,
    "totalWorkoutPlans": 3,
    "lastCheckIn": "2024-01-15T18:30:00Z",
    "isActive": true,
    "activityLevel": "high"
  }
}

Activity Level Calculation:
  - high: score >= 30 (checkIns * 2 + bookings)
  - medium: score >= 10
  - low: score > 0
  - inactive: score = 0
```

### Create Member

```
POST /members

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "555-1234",
  "healthNotes": "...",
  "fitnessGoals": ["Weight loss"],
  "membershipPlanId": "uuid",
  "referredByCode": "ABC12345" (optional),
  "familyParentMemberId": "uuid" (optional)
}

Response: 201 Created
{
  "success": true,
  "data": { MemberEntity },
  "message": "Member created successfully"
}

Business Logic:
  - Validates referral code if provided (must be same gym)
  - Generates unique referralCode (8-char hex string)
  - Generates unique qrCodeHash for check-ins
  - Creates initial subscription based on membership plan
  - Sets membershipEndDate = startDate + plan.durationDays

Authorization:
  - Roles: super_admin, gym_manager, receptionist

Validation:
  - Email must be unique within gym
  - Password must match validation regex (uppercase, lowercase, digit, special char)
  - Membership plan must exist in same gym
```

### Update Member Profile

```
PUT /members/:id

Request Body (all fields optional):
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "555-1234",
  "healthNotes": "Updated notes",
  "fitnessGoals": ["Weight loss", "Strength"]
}

Response: 200 OK
{
  "success": true,
  "data": { MemberEntity },
  "message": "Member updated successfully"
}

Authorization:
  - Members can update their own profile
  - Staff can update any member's profile in their gym

Note:
  - Does NOT update password, membership dates, or referral code
  - Password changes via separate endpoint
```

### Suspend Membership

```
PUT /members/:id/suspend

Request Body:
{
  "reason": "Non-payment"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "paused",
    "metadata": {
      "suspendedAt": "2024-01-15T10:30:00Z",
      "suspensionReason": "Non-payment"
    }
  },
  "message": "Membership suspended successfully"
}

Authorization:
  - Roles: super_admin, gym_manager, receptionist

Errors:
  - 400 Bad Request: No active subscription to suspend
```

### Resume Membership

```
PUT /members/:id/resume

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    "metadata": {
      "resumedAt": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Membership resumed successfully"
}

Authorization:
  - Roles: super_admin, gym_manager, receptionist

Errors:
  - 400 Bad Request: No suspended subscription to resume
```

### Link Family Member

```
POST /members/:id/family

Request Body:
{
  "familyMemberId": "uuid"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "primaryMemberId": "uuid",
    "familyMemberId": "uuid",
    "message": "Family member linked successfully"
  }
}

Authorization:
  - Members can link their own family
  - Staff can link family for any member in their gym

Business Logic:
  - Stores familyMemberId in primaryMember.metadata.familyMembers[]
  - Stores primaryMemberId in familyMember.metadata.familyParent
```

### Unlink Family Member

```
DELETE /members/:id/family/:familyMemberId

Response: 200 OK
{
  "success": true,
  "data": {
    "primaryMemberId": "uuid",
    "familyMemberId": "uuid",
    "message": "Family member unlinked successfully"
  }
}

Authorization:
  - Members can unlink their own family
  - Staff can unlink family for any member in their gym

Errors:
  - 400 Bad Request: Family member not linked
```

### Delete Member

```
DELETE /members/:id

Response: 200 OK
{
  "success": true,
  "data": { "success": true, "message": "Member deleted successfully" }
  "message": "Member deleted successfully"
}

Authorization:
  - Roles: super_admin, gym_manager

Cascading:
  - Related bookings (soft delete expected)
  - Related subscriptions (soft delete expected)
  - Related check-ins (soft delete expected)
```

## DTOs

### CreateMemberDto

```typescript
{
  firstName: string (required)
  lastName: string (required)
  email: string (required, valid email)
  password: string (required, regex: uppercase+lowercase+digit+special)
  dateOfBirth?: Date
  gender?: enum(Male|Female|Other|Prefer not to say)
  emergencyContactName?: string
  emergencyContactPhone?: string
  healthNotes?: string
  fitnessGoals?: string[]
  membershipPlanId: UUID (required)
  referredByCode?: string (referral code, validated)
  familyParentMemberId?: UUID
}
```

### UpdateMemberDto

```typescript
{
  firstName?: string
  lastName?: string
  email?: string (must be unique in gym)
  dateOfBirth?: Date
  gender?: enum
  emergencyContactName?: string
  emergencyContactPhone?: string
  healthNotes?: string
  fitnessGoals?: string[]
}
```

### MemberResponseDto

Exposes all public member fields (excludes sensitive data like passwords).

### MemberProfileResponseDto

Extended response including:
- Current active subscription with plan details
- Family members
- Referral statistics

### ReferralStatsDto

```typescript
{
  memberId: string
  referralCode: string
  totalReferrals: number
  activeReferrals: number
  referrals: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    joinDate: Date
    status: string
  }>
  estimatedRewards: number
}
```

## Service Methods

### MembersService

#### Public Methods

```typescript
// Queries
findAll(gymId, page?, limit?, filters?)
  → { data: MemberEntity[], pagination: {...} }

findById(memberId, gymId)
  → MemberEntity

findByQrCode(qrCodeHash, gymId)
  → MemberEntity

findByReferralCode(referralCode)
  → MemberEntity

search(gymId, query, filters?)
  → MemberEntity[]

getActivityStats(memberId, gymId)
  → { totalBookings, totalCheckIns, lastCheckIn, activityLevel, ... }

getReferralStats(memberId, gymId)
  → ReferralStatsDto

getFamilyMembers(primaryMemberId, gymId)
  → MemberEntity[]

// Commands
create(gymId, createMemberDto)
  → MemberEntity

update(memberId, gymId, updateMemberDto)
  → MemberEntity

delete(memberId, gymId)
  → { success, message }

suspendMembership(memberId, gymId, reason)
  → MembershipSubscriptionEntity

resumeMembership(memberId, gymId)
  → MembershipSubscriptionEntity

linkFamilyMember(primaryMemberId, familyMemberId, gymId)
  → { primaryMemberId, familyMemberId, message }

unlinkFamilyMember(primaryMemberId, familyMemberId, gymId)
  → { primaryMemberId, familyMemberId, message }

// Internal (called by other modules)
incrementCheckInCount(memberId)
  → void
```

## Multi-Tenancy

### Tenant Isolation

All queries automatically filter by `gymId` from the authenticated user's context:

```typescript
// MembersService enforces gymId on all operations
const member = await this.membersRepository.findOne({
  where: { id: memberId, gymId }
});

// Query builders include gym filter
query.where('member.gymId = :gymId', { gymId })
```

### Cross-Gym Operations

- Referral codes are globally unique but validated against gym
- QR codes are globally unique
- Members from different gyms cannot be linked as family

## Referral System

### Referral Code Generation

- 8-character hexadecimal string (e.g., "ABC12345")
- Globally unique in database
- Provided to member upon creation
- Can be shared for recruitment

### Referral Tracking

```typescript
// When creating member with referredByCode
const referrer = await this.findByReferralCode(referralCode);
member.referredBy = referrer.id;

// Query referrals
const referrals = await this.membersRepository.find({
  where: { referredBy: memberId, gymId }
});
```

### Referral Rewards

```typescript
// Current calculation: $10 per active referral
const estimatedRewards = activeReferrals * 10;

// Note: Actual reward redemption handled by PaymentsService
```

## QR Code System

### Generation

```typescript
// 32 bytes of random data, hex-encoded
qrCodeHash = crypto.randomBytes(32).toString('hex');
```

### Check-in Lookup

```
GET /members/qr/:qrCodeHash
```

Returns member data for check-in processing (see CheckInsService integration).

## Family Accounts

### Structure

```
Primary Member (parent)
├── metadata.familyMembers: ["child-id-1", "child-id-2"]

Child Member
├── metadata.familyParent: "parent-id"
```

### Use Cases

- Family memberships (parents + children)
- Grouped billing (optional future feature)
- Family activity tracking (dashboard feature)

### Operations

```typescript
// Link child to parent
await membersService.linkFamilyMember(parentId, childId, gymId);

// Get all children
const children = await membersService.getFamilyMembers(parentId, gymId);

// Unlink
await membersService.unlinkFamilyMember(parentId, childId, gymId);
```

## Authorization & Access Control

### Role-Based Access

```
super_admin:
  - Can view/manage members from any gym
  - Cannot be viewed/managed by other users

gym_manager:
  - Can view all members in their gym
  - Can create/update/delete members in their gym
  - Can suspend/resume memberships

receptionist:
  - Can view all members in their gym
  - Can create members in their gym
  - Can suspend/resume memberships
  - Cannot delete members

trainer:
  - Can view all members in their gym
  - Cannot create/update/delete members

member:
  - Can view their own profile
  - Can update their own profile
  - Can view their own referrals
  - Can view their own family
  - Can view their own activity

(No role):
  - Cannot access any member endpoints
```

### API Guard

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```

Both guards applied to controller:
- JwtAuthGuard: Verifies JWT token validity
- RolesGuard: Checks @Roles() decorator against user's role

## Error Handling

### Common Errors

```
400 Bad Request:
  - Invalid referral code for gym
  - Email already registered in gym
  - Invalid password format
  - No active subscription to suspend
  - Family member not linked

404 Not Found:
  - Member not found
  - Membership plan not found
  - Referral code not found

409 Conflict:
  - Email already exists in gym
  - Referral code already exists

403 Forbidden:
  - Member viewing other member's profile
  - User without required role
  - Cross-gym operations
```

## Performance Considerations

### Indexes

- `idx_members_gym`: Fast gym-scoped queries
- `idx_members_qr`: Fast check-in lookups by QR code
- `idx_members_referral`: Fast referral code validation

### Query Optimization

- Pagination default 20 records per page
- Search uses ILIKE (case-insensitive) for better UX
- Relationship loading with `leftJoinAndSelect` for N+1 prevention

### Caching Opportunities

- Member profile (cache key: `member:{id}`, TTL: 5 min)
- Referral stats (cache key: `referral:{id}`, TTL: 1 hour)
- Family members (cache key: `family:{id}`, TTL: 5 min)

## Integration Points

### AuthService

- Password hashing on member creation
- JWT token verification

### CheckInsService (Future)

- Calls `incrementCheckInCount(memberId)`
- Looks up member via `findByQrCode()`

### BookingsService (Future)

- Links bookings to members
- Updates activity stats

### PaymentsService (Future)

- Manages membership subscriptions
- Calculates referral rewards

### NotificationsService (Future)

- Sends emails on membership status changes
- Sends referral notifications

## Testing

### Test Scenarios

```typescript
// CRUD Operations
✓ Create member with referral code
✓ Create member without referral code
✓ Update member profile
✓ Delete member (cascades)
✓ Get member by ID
✓ Get member by QR code
✓ Get member by referral code

// Filtering & Search
✓ Filter members by status
✓ Filter members by membership plan
✓ Search members by name
✓ Search members by email
✓ Search members by referral code
✓ Pagination works correctly

// Family Accounts
✓ Link family member
✓ Get family members
✓ Unlink family member
✓ Cannot link self

// Referrals
✓ Generate unique referral code
✓ Get referral statistics
✓ Count active referrals
✓ Calculate estimated rewards

// Membership
✓ Suspend membership
✓ Resume membership
✓ Cannot suspend already suspended

// Authorization
✓ Members can view own profile
✓ Members cannot view others' profiles
✓ Staff can view any profile
✓ Gym managers can manage members
✓ Receptionists can create members
✓ Trainers cannot create members

// Multi-Tenancy
✓ Members isolated by gym
✓ Cross-gym queries blocked
✓ Referral code validated by gym
```

## Future Enhancements

1. **Member Statistics Dashboard**
   - Most active members
   - Member retention analysis
   - Revenue per member

2. **Referral Program Enhancement**
   - Tiered rewards (higher rewards for more referrals)
   - Referral reward redemption
   - Referral tracking analytics

3. **Advanced Membership Management**
   - Pause/freeze memberships (different from suspend)
   - Membership upgrade/downgrade
   - Proration calculations

4. **Member Segmentation**
   - Save member segments (tags)
   - Segment-based communications
   - Segment analytics

5. **Integration with External Systems**
   - CRM integration for member data
   - Health metrics tracking
   - Wearable device integration
