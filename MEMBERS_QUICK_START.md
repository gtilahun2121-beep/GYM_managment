# Member Management API - Quick Start Guide

## Overview

The Member Management API provides complete member lifecycle management including CRUD, profile management, referral tracking, and family accounts.

## Quick Start Examples

### 1. Create a New Member

```bash
curl -X POST http://localhost:3000/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "membershipPlanId": "plan-uuid",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "555-1234"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "referralCode": "ABC12345",
    "qrCodeHash": "hash...",
    "membershipStartDate": "2024-08-25",
    "totalCheckIns": 0
  },
  "message": "Member created successfully"
}
```

### 2. List Members with Pagination

```bash
curl http://localhost:3000/members?page=1&limit=20&status=active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "totalCheckIns": 45
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### 3. Get Member Profile

```bash
curl http://localhost:3000/members/member-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Search Members

```bash
# Search by name
curl "http://localhost:3000/members/search?q=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search with filters
curl "http://localhost:3000/members/search?q=&status=active&joinDateFrom=2024-01-01&joinDateTo=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Member by QR Code (Check-in)

```bash
curl http://localhost:3000/members/qr/qr-hash \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update Member Profile

```bash
curl -X PUT http://localhost:3000/members/member-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jonathan",
    "healthNotes": "Updated health info",
    "fitnessGoals": ["Cardio", "Strength"]
  }'
```

### 7. Get Referral Statistics

```bash
curl http://localhost:3000/members/member-uuid/referrals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "memberId": "member-uuid",
    "referralCode": "ABC12345",
    "totalReferrals": 5,
    "activeReferrals": 3,
    "estimatedRewards": 30,
    "referrals": [
      {
        "id": "referred-uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "joinDate": "2024-02-01",
        "status": "active"
      }
    ]
  }
}
```

### 8. Create Member with Referral Code

```bash
curl -X POST http://localhost:3000/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass456!",
    "membershipPlanId": "plan-uuid",
    "referredByCode": "ABC12345"
  }'
```

### 9. Link Family Member

```bash
curl -X POST http://localhost:3000/members/parent-uuid/family \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "familyMemberId": "child-uuid"
  }'
```

### 10. Get Family Members

```bash
curl http://localhost:3000/members/parent-uuid/family \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Get Member Activity Statistics

```bash
curl http://localhost:3000/members/member-uuid/activity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "memberId": "member-uuid",
    "totalBookings": 25,
    "totalCheckIns": 45,
    "totalWorkoutPlans": 3,
    "lastCheckIn": "2024-08-25T18:30:00Z",
    "isActive": true,
    "activityLevel": "high"
  }
}
```

### 12. Suspend Membership

```bash
curl -X PUT http://localhost:3000/members/member-uuid/suspend \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Non-payment"
  }'
```

### 13. Resume Membership

```bash
curl -X PUT http://localhost:3000/members/member-uuid/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 14. Delete Member

```bash
curl -X DELETE http://localhost:3000/members/member-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Authorization Guide

### Who Can Do What

| Operation | Required Role | Special Rules |
|-----------|---|---|
| View all members | Trainer, Receptionist, Manager, Super Admin | Members only see own profile |
| Create member | Receptionist, Manager, Super Admin | Can create in their gym only |
| Update member | Member (self), Manager, Super Admin | Members only update their own |
| Delete member | Manager, Super Admin | Cannot be undone |
| View referrals | Member (self), Manager, Super Admin | Members only see their own |
| Manage family | Member (self), Manager, Super Admin | Members only manage their own |
| Suspend/Resume | Receptionist, Manager, Super Admin | Receptionist+ within gym |

## Password Validation Rules

Passwords must meet ALL of these criteria:
- ✓ Minimum 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one digit (0-9)
- ✓ At least one special character (!@#$%^&*)

**Valid Example**: `SecurePass123!`
**Invalid Example**: `password123` (missing uppercase and special char)

## Common Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Email already registered for this gym"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only view your own profile"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Member not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already exists in gym"
}
```

## Referral System

### How It Works

1. **Member signs up** → Gets unique referral code (e.g., "ABC12345")
2. **Shares code** with friends/family
3. **Friend signs up with code** → Linked as referral
4. **Tracking** → $10 reward per active referral
5. **Rewards** → Can be redeemed (future feature)

### Example Flow

```bash
# Step 1: Member A signs up (gets referralCode: ABC12345)
POST /members → {referralCode: "ABC12345"}

# Step 2: Member B signs up with referral code
POST /members {referredByCode: "ABC12345"}

# Step 3: Check Member A's referrals
GET /members/member-a-uuid/referrals
→ totalReferrals: 1, activeReferrals: 1, estimatedRewards: 10
```

## Family Account Management

### Use Case

Parent member wants to link child's account for grouped management.

### Example Flow

```bash
# Step 1: Both members already created

# Step 2: Link child to parent
POST /members/parent-uuid/family
{
  "familyMemberId": "child-uuid"
}

# Step 3: View all family members
GET /members/parent-uuid/family

# Step 4: Unlink when needed
DELETE /members/parent-uuid/family/child-uuid
```

## Activity Level Classification

Activity scores determine engagement level:

```
Score = (totalCheckIns × 2) + totalBookings

high:      score ≥ 30    (Very engaged)
medium:    score ≥ 10    (Moderately engaged)
low:       score > 0     (Minimally engaged)
inactive:  score = 0     (Not engaged)
```

## Membership Status

| Status | Meaning | Can Book? |
|--------|---------|-----------|
| `active` | Current valid membership | Yes |
| `paused` | Suspended/frozen | No |
| `cancelled` | Member ended | No |
| `expired` | Membership ended | No |
| `pending_payment` | Awaiting payment | No |

## Filtering & Pagination

### Pagination Parameters
```
?page=1              # Page number (default: 1)
&limit=20            # Records per page (default: 20, max: 100)
```

### Filter Parameters
```
&status=active                # active|inactive|paused
&search=john                  # Search name/email
&joinDateFrom=2024-01-01     # ISO date
&joinDateTo=2024-12-31       # ISO date
&membershipPlanId=uuid        # Specific plan
```

### Example
```bash
curl "http://localhost:3000/members?page=2&limit=50&status=active&search=john&joinDateFrom=2024-01-01" \
  -H "Authorization: Bearer TOKEN"
```

## Best Practices

1. **Always validate JWT token** before making requests
2. **Use pagination** for list endpoints (default 20 per page)
3. **Handle errors gracefully** - check statusCode in response
4. **Cache member data** - profiles don't change frequently
5. **Use search instead of list** for large datasets
6. **Respect rate limits** - implement backoff strategy
7. **Log API calls** for audit trail
8. **Validate passwords** before submission

## Integration Examples

### With Check-in System
```bash
# Lookup member for check-in
GET /members/qr/qr-hash-code
→ Returns member data and active subscription status
```

### With Referral System
```bash
# Track referral on signup
POST /members
{
  "referredByCode": "ABC12345"
}
→ Automatically links referrer

# Get referral rewards
GET /members/uuid/referrals
→ Calculate rewards based on active referrals
```

### With Analytics
```bash
# Get activity for dashboard
GET /members/:id/activity
→ Returns engagement metrics for reporting
```

## Support & Documentation

- **API Docs**: See [MEMBERS.md](./MEMBERS.md) for full documentation
- **Examples**: See [members.example.ts](./apps/api/src/modules/members/members.example.ts)
- **Issues**: Report via GitHub issues

## Next Steps

1. Create a member: `POST /members`
2. Get referral code from response
3. Share referral code with others
4. Track referrals: `GET /members/:id/referrals`
5. Manage family accounts: `POST/GET/DELETE /members/:id/family`
