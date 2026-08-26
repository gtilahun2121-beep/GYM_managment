# Gym Management System - Quick Reference

**Last Updated**: August 25, 2026 | **Status**: 5/30 Tasks Complete (17%)

---

## 🎯 What's Ready to Use

### ✅ Authentication System
```
Features:
- JWT-based authentication
- 5 role types (super_admin, gym_manager, receptionist, trainer, member)
- Multi-factor authentication (TOTP)
- Email verification
- Password reset
- Secure password hashing (bcrypt)

Usage:
POST /auth/login              → Get access/refresh tokens
POST /auth/register           → Create new user
POST /auth/refresh            → Refresh access token
POST /auth/forgot-password    → Request password reset
POST /auth/mfa/setup          → Enable MFA
```

### ✅ Member Management
```
Features:
- Complete member CRUD
- Member profiles with health info
- Family account linking
- Referral code generation & tracking
- QR codes for check-in
- Membership suspension/resumption
- Activity statistics

Usage:
POST   /members                           → Create member
GET    /members                           → List (paginated)
GET    /members/:id                       → Get profile
PUT    /members/:id                       → Update profile
DELETE /members/:id                       → Delete member
GET    /members/search?q=john             → Search
GET    /members/:id/referrals             → Get referral stats
POST   /members/:id/family                → Link family
GET    /members/:id/family                → Get family
PUT    /members/:id/suspend               → Suspend
PUT    /members/:id/resume                → Resume
```

### ✅ Database
```
Tables:
- gyms, users, members, membership_plans, membership_subscriptions
- class_types, rooms, class_sessions
- bookings, waitlist_entries, payments, check_ins
- exercises, workout_plans, plan_exercises, member_progress
- notifications

Features:
- Multi-tenancy (gymId isolation)
- 30+ strategic indexes
- Proper relationships
- Soft delete support
- Migration system
```

---

## 🔧 Common Tasks

### Create a Member
```bash
curl -X POST http://localhost:3000/members \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "membershipPlanId": "uuid"
  }'
```

### Create Member with Referral
```bash
# Get referrer's code first
GET /members/{id}/referrals
# Returns: referralCode: "ABC12345"

# Then create new member
POST /members
{
  "email": "jane@example.com",
  "referredByCode": "ABC12345"
}
```

### Get Member Referral Stats
```bash
curl http://localhost:3000/members/uuid/referrals \
  -H "Authorization: Bearer TOKEN"
# Returns: totalReferrals, activeReferrals, estimatedRewards, referral list
```

### Search Members
```bash
curl "http://localhost:3000/members/search?q=john" \
  -H "Authorization: Bearer TOKEN"

# With filters
curl "http://localhost:3000/members?status=active&page=1&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

### Check Member for Check-in
```bash
curl http://localhost:3000/members/qr/qr-code-hash \
  -H "Authorization: Bearer TOKEN"
# Returns: Member name, active subscription status
```

### Link Family Members
```bash
# Link child to parent
POST /members/{parentId}/family
{ "familyMemberId": "{childId}" }

# Get family members
GET /members/{parentId}/family
```

---

## 🔐 Password Requirements

✓ Minimum 8 characters  
✓ At least 1 uppercase letter (A-Z)  
✓ At least 1 lowercase letter (a-z)  
✓ At least 1 digit (0-9)  
✓ At least 1 special character (!@#$%^&*)

**Valid**: `SecurePass123!`  
**Invalid**: `password123` (missing uppercase + special)

---

## 👥 User Roles & Permissions

| Role | Members | Classes | Bookings | Payments | Analytics |
|------|---------|---------|----------|----------|-----------|
| super_admin | Full | Full | Full | Full | Full |
| gym_manager | Full | Full | Full | Full | Full |
| receptionist | R/U/S | R | R | R | View |
| trainer | R | R | R | - | View |
| member | Self | R | Self | Self | Self |

Legend: R=Read, U=Update, S=Suspend, Self=Own data only

---

## 📊 Entity Relationships

```
Gym (1) ──→ (N) Users
         ──→ (N) Members
         ──→ (N) Classes
         ──→ (N) Bookings
         ──→ (N) Payments

Member (1) ──→ (N) Subscriptions
          ──→ (N) Bookings
          ──→ (N) CheckIns
          ──→ (N) Progress
          ──→ (1) ReferredBy

MembershipPlan (1) ──→ (N) Subscriptions

ClassSession (1) ──→ (N) Bookings
```

---

## 🎯 Typical Workflows

### Member Registration Flow
```
1. POST /auth/register
   ↓ Creates user account
2. POST /members (staff creates or member self-registers)
   ↓ Creates member profile + initial subscription
3. GET /members/:id
   ↓ Returns member with referralCode
4. Member shares referralCode with friends
```

### Check-in Flow
```
1. Member arrives at gym
2. GET /members/qr/{qrCodeHash}
   ↓ Look up member
3. Check member.subscriptions[].status == 'active'
4. Record check-in (future CheckInsService)
5. Member can now access facilities
```

### Referral Reward Flow
```
1. Member A has referralCode: "ABC12345"
2. Member B signs up with referralCode: "ABC12345"
3. Member B becomes member A's referral
4. When Member B's subscription is active:
   GET /members/A/referrals
   ↓ activeReferrals: 1
   ↓ estimatedRewards: $10
5. Rewards can be redeemed (future PaymentsService)
```

### Membership Suspension Flow
```
1. Member owes payment
2. PUT /members/{id}/suspend
   { "reason": "Non-payment" }
   ↓ Sets subscription.status = 'paused'
3. Member cannot book classes
4. GET /members/{id}/referrals
   ↓ activeReferrals decreases (affects rewards)
5. PUT /members/{id}/resume
   ↓ Sets subscription.status = 'active' again
```

---

## 📈 Activity Level Scoring

```
Score = (totalCheckIns × 2) + totalBookings

high      ≥ 30   (Very engaged, frequent visitor)
medium    ≥ 10   (Moderately engaged)
low       > 0    (Minimally engaged)
inactive  = 0    (Not engaged, new member)
```

---

## 💡 API Response Format

### Success (200 OK)
```json
{
  "success": true,
  "data": { /* Response data */ },
  "pagination": { /* Optional */ }
}
```

### Creation (201 Created)
```json
{
  "success": true,
  "data": { /* Created object */ },
  "message": "Member created successfully"
}
```

### Error (4xx/5xx)
```json
{
  "statusCode": 400,
  "message": "Error description"
}
```

---

## 🔍 Search & Filter Examples

### List Members (Paginated)
```
GET /members?page=1&limit=20&status=active
```

### Search by Name
```
GET /members/search?q=john
```

### Search with Date Range
```
GET /members/search?q=&joinDateFrom=2024-01-01&joinDateTo=2024-12-31
```

### Search by Plan
```
GET /members/search?q=&membershipPlanId=uuid
```

### Combined Filters
```
GET /members?page=1&limit=50&status=active&search=john&joinDateFrom=2024-01-01
```

---

## 📱 QR Code System

```
QR Code Generation:
1. Member created → Unique qrCodeHash generated
2. Hash: 64-character hexadecimal string
3. Globally unique across all gyms

Check-in Lookup:
GET /members/qr/{qrCodeHash}
→ Returns member profile
→ Check subscription.status
→ Allow/deny facility access
```

---

## 🎁 Referral Code System

```
Code Generation:
1. Member created → Unique referralCode generated
2. Format: 8-character hexadecimal (e.g., "ABC12345")
3. Globally unique across all gyms

Sharing:
- Member shares code with friends
- Friends use code during signup
- Referral tracked in member.referredBy

Rewards:
- $10 per active referral
- Active = member.subscription.status === 'active'
- GET /members/{id}/referrals → Shows total rewards
```

---

## 👨‍👩‍👧 Family Accounts

```
Structure:
Parent Member
├── metadata.familyMembers: [child1, child2, ...]
├── Child Member 1
│   └── metadata.familyParent: parent
└── Child Member 2
    └── metadata.familyParent: parent

Operations:
POST   /members/{parentId}/family              → Link child
GET    /members/{parentId}/family              → List children
DELETE /members/{parentId}/family/{childId}    → Unlink

Notes:
- All in same gym
- Independent subscriptions
- Grouped dashboard view (future)
```

---

## 🚨 Common Errors & Solutions

### 400 Bad Request
```
Message: "Email already registered for this gym"
Fix: Use different email or check if member exists
```

### 403 Forbidden
```
Message: "You can only view your own profile"
Fix: Members cannot view other members (staff can)
```

### 404 Not Found
```
Message: "Member not found"
Fix: Check memberId is correct and in your gym
```

### 409 Conflict
```
Message: "Email already exists in gym"
Fix: Email must be unique per gym
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Project overview |
| [MEMBERS.md](./MEMBERS.md) | Member API docs |
| [AUTH.md](./AUTH.md) | Authentication docs |
| [ADVANCED_AUTH.md](./ADVANCED_AUTH.md) | MFA & email docs |
| [DATABASE.md](./DATABASE.md) | Database schema |
| [MEMBERS_QUICK_START.md](./MEMBERS_QUICK_START.md) | Quick examples |
| [FILE_INDEX.md](./FILE_INDEX.md) | Complete file listing |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Architecture overview |

---

## 🔗 Endpoint Quick Links

### Members
- [POST /members](./MEMBERS.md#create-member) - Create
- [GET /members](./MEMBERS.md#get-all-members) - List
- [GET /members/:id](./MEMBERS.md#get-member-profile) - Get profile
- [PUT /members/:id](./MEMBERS.md#update-member-profile) - Update
- [DELETE /members/:id](./MEMBERS.md#delete-member) - Delete
- [GET /members/search](./MEMBERS.md#search-members) - Search
- [GET /members/qr/:hash](./MEMBERS.md#get-member-by-qr-code) - Check-in lookup
- [GET /members/:id/referrals](./MEMBERS.md#get-member-referral-statistics) - Referral stats
- [GET /members/:id/family](./MEMBERS.md#get-family-members) - Family list
- [GET /members/:id/activity](./MEMBERS.md#get-member-activity-statistics) - Activity
- [POST /members/:id/family](./MEMBERS.md#link-family-member) - Link family
- [PUT /members/:id/suspend](./MEMBERS.md#suspend-membership) - Suspend
- [PUT /members/:id/resume](./MEMBERS.md#resume-membership) - Resume

### Authentication
- [POST /auth/login](./AUTH.md) - Login
- [POST /auth/register](./AUTH.md) - Register
- [POST /auth/refresh](./AUTH.md) - Refresh token
- [POST /auth/forgot-password](./ADVANCED_AUTH.md) - Password reset
- [POST /auth/mfa/setup](./ADVANCED_AUTH.md) - Enable MFA

---

## 🆘 Getting Help

1. **API Issues**: Check [MEMBERS.md](./MEMBERS.md) or [AUTH.md](./AUTH.md)
2. **Quick Examples**: See [MEMBERS_QUICK_START.md](./MEMBERS_QUICK_START.md)
3. **Code Examples**: Check [members.example.ts](./apps/api/src/modules/members/members.example.ts)
4. **Architecture**: Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
5. **Database**: See [DATABASE.md](./DATABASE.md)

---

## 🚀 Next Phase

**Task #6**: Class Scheduling
- Class types and sessions
- Recurring class support
- Room and trainer management
- Capacity handling

---

*Quick Reference • Gym Management System • V1.0*  
*For detailed docs, see [FILE_INDEX.md](./FILE_INDEX.md)*
