# Database Schema Documentation

## Overview

The Gym Management System uses PostgreSQL 16 with a comprehensive schema designed for multi-tenant SaaS architecture. The database includes 15 core tables organized into logical domains.

## Architecture Principles

### Multi-Tenancy
Every table that stores business data includes a `gymId` foreign key to `gyms` table, enabling complete data isolation between different gym instances.

### Soft Deletes
Instead of hard deletes, entities use `status` fields (`active`, `inactive`, `suspended`, `deleted`) to maintain audit trails and allow data recovery.

### JSONB Flexibility
Complex, gym-specific configurations are stored in JSONB columns (`settings`, `features`, `metadata`) rather than creating new tables, allowing flexibility without schema changes.

### Temporal Tracking
All entities include `createdAt` and `updatedAt` timestamps using `timestamptz` for timezone-aware tracking across different gym locations.

### Partitioning & Indexing
Tables with high volume (`payments`, `check_ins`, `notifications`) include strategic indexes for query performance. Large-scale deployments can implement time-based partitioning.

## Entity Relationship Diagram

```
                        ┌─────────────────┐
                        │      gyms       │
                        │  (multi-tenant) │
                        └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────┴────┐  ┌───┴────┐  ┌───┴────┐
              │  users   │  │ members │  │  rooms │
              │  (roles) │  └────┬────┘  │classes │
              └─────┬────┘       │       └────────┘
                    │    ┌───────┴──────┐
           ┌────────┴────┤              │
           │             │              │
     ┌─────┴──────┐  ┌───┴────────┐  ┌─┴──────────────┐
     │ class_     │  │membership_ │  │membership_     │
     │ sessions   │  │plans       │  │subscriptions   │
     │ (trainer)  │  └────────────┘  └──┬──────────────┘
     └──────┬─────┘                      │
            │                     ┌──────┴──────┐
      ┌─────┴────────┐           │             │
      │              │      ┌────┴────┐   ┌───┴────┐
  ┌───┴──────┐   ┌──┴──┐   │payments  │   │check_  │
  │bookings  │   │ qr  │   │(billing) │   │ins     │
  │(booking) │   │code │   └──────────┘   │(attend)│
  └──────────┘   └─────┘                   └────────┘

workout_plans ──┬──> plan_exercises ──> exercises
                └──> member_progress

notifications (async comms)
```

## Core Tables

### 1. **gyms** - Multi-Tenant Root
Stores gym locations and configurations.

```sql
CREATE TABLE gyms (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zipCode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'US',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  phone VARCHAR(30),
  email VARCHAR(255),
  logoUrl VARCHAR(500),
  settings JSONB DEFAULT '{}',  -- Gym-specific config
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ,
  updatedAt TIMESTAMPTZ
);
```

**Key Features:**
- Timezone support for multi-location operations
- JSONB settings for gym-specific configurations (max bookings, cancellation policy, etc.)
- Slug for URL-friendly gym identification

---

### 2. **users** - Authentication & Identity
Staff and member user accounts with role-based access.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  gymId UUID FOREIGN KEY,
  email VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM ('super_admin', 'gym_manager', 'receptionist', 'trainer', 'member'),
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  avatarUrl VARCHAR(500),
  emailVerified BOOLEAN DEFAULT false,
  mfaEnabled BOOLEAN DEFAULT false,
  mfaSecret VARCHAR(255),
  lastLoginAt TIMESTAMPTZ,
  status ENUM ('active', 'inactive', 'suspended', 'deleted'),
  createdAt TIMESTAMPTZ,
  updatedAt TIMESTAMPTZ,
  UNIQUE(gymId, email)
);
```

**Indexes:**
- `idx_users_gym_email` - Quick lookup by email within gym
- `idx_users_role` - Filter by role for authorization
- `idx_users_status` - Find active/inactive users

---

### 3. **members** - Member Profiles
Extended member information beyond user accounts.

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY,
  userId UUID FOREIGN KEY REFERENCES users,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  dateOfBirth DATE,
  gender VARCHAR(20),
  emergencyContactName VARCHAR(100),
  emergencyContactPhone VARCHAR(30),
  healthNotes TEXT,
  fitnessGoals JSONB DEFAULT '[]',
  qrCodeHash VARCHAR(255) UNIQUE,  -- QR check-in
  referralCode VARCHAR(20) UNIQUE,  -- Referral program
  referredBy UUID FOREIGN KEY REFERENCES members,
  membershipStartDate DATE,
  membershipEndDate DATE,
  totalCheckIns INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ,
  updatedAt TIMESTAMPTZ
);
```

**Features:**
- QR code hash for fast check-in lookups
- Referral code for member referral program
- Fitness goals stored as JSON for flexibility
- Health notes for trainer reference

---

### 4. **membership_plans** - Subscription Tiers
Configurable membership plans with features.

```sql
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  name VARCHAR(100),
  description TEXT,
  billingFrequency ENUM ('monthly', 'quarterly', 'annual', 'one_time'),
  price NUMERIC(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  features JSONB DEFAULT '{}',  -- Feature flags
  maxBookingsPerWeek INTEGER DEFAULT 7,
  cancellationPolicy TEXT,
  isActive BOOLEAN DEFAULT true,
  displayOrder INTEGER,
  createdAt TIMESTAMPTZ
);
```

**Features JSONB Example:**
```json
{
  "classAccess": true,
  "maxClassesPerWeek": 7,
  "equipmentAccess": true,
  "showerAccess": true,
  "personalTraining": false,
  "guestPasses": false,
  "walkinAccess": false
}
```

---

### 5. **membership_subscriptions** - Active Subscriptions
Tracks member subscriptions with Stripe integration.

```sql
CREATE TABLE membership_subscriptions (
  id UUID PRIMARY KEY,
  memberId UUID FOREIGN KEY REFERENCES members,
  planId UUID FOREIGN KEY REFERENCES membership_plans,
  status ENUM ('active', 'cancelled', 'expired', 'frozen', 'pending_payment'),
  startDate DATE,
  endDate DATE,
  autoRenew BOOLEAN DEFAULT true,
  stripeSubscriptionId VARCHAR(255),
  stripeCustomerId VARCHAR(255),
  paymentMethodId UUID,
  cancelledAt TIMESTAMPTZ,
  cancellationReason VARCHAR(255),
  frozenUntil DATE,
  createdAt TIMESTAMPTZ,
  updatedAt TIMESTAMPTZ
);
```

---

### 6. **class_types** - Class Templates
Master list of class types (Yoga, HIIT, Spin, etc.).

```sql
CREATE TABLE class_types (
  id UUID PRIMARY KEY,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  name VARCHAR(100),
  description TEXT,
  durationMinutes INTEGER DEFAULT 60,
  intensityLevel ENUM ('low', 'moderate', 'high', 'extreme'),
  maxCapacity INTEGER DEFAULT 20,
  colorCode VARCHAR(7) DEFAULT '#3B82F6',  -- UI color
  equipmentNeeded JSONB DEFAULT '[]',
  imageUrl VARCHAR(500),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ
);
```

---

### 7. **rooms** - Gym Spaces
Physical rooms/studios where classes are held.

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  name VARCHAR(100),
  capacity INTEGER,
  type VARCHAR(50),  -- 'Studio', 'Cycling', 'Multi-purpose'
  amenities JSONB DEFAULT '[]',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ
);
```

---

### 8. **class_sessions** - Scheduled Classes
Specific instances of classes at particular times.

```sql
CREATE TABLE class_sessions (
  id UUID PRIMARY KEY,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  classTypeId UUID FOREIGN KEY REFERENCES class_types,
  trainerId UUID FOREIGN KEY REFERENCES users,
  roomId UUID FOREIGN KEY REFERENCES rooms,
  startTime TIMESTAMPTZ,
  endTime TIMESTAMPTZ,
  maxCapacity INTEGER,
  currentBookings INTEGER DEFAULT 0,
  waitlistCount INTEGER DEFAULT 0,
  status ENUM ('scheduled', 'cancelled', 'completed', 'in_progress'),
  isRecurring BOOLEAN DEFAULT false,
  recurrenceRule VARCHAR(255),  -- RRULE format
  parentSessionId UUID,  -- For recurring series
  createdAt TIMESTAMPTZ
);
```

**Indexes for Performance:**
- `idx_sessions_time` - Range queries for date/time
- `idx_sessions_gym_time` - Queries by gym and time range
- `idx_sessions_trainer` - Queries by trainer schedule
- `idx_sessions_status` - Filter by status

---

### 9. **bookings** - Class Reservations
Member reservations for specific class sessions.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  sessionId UUID FOREIGN KEY REFERENCES class_sessions,
  memberId UUID FOREIGN KEY REFERENCES members,
  status ENUM ('confirmed', 'cancelled', 'no_show', 'attended', 'waitlist'),
  bookedAt TIMESTAMPTZ DEFAULT NOW(),
  checkedInAt TIMESTAMPTZ,
  cancelledAt TIMESTAMPTZ,
  cancellationReason VARCHAR(255),
  waitlistPosition INTEGER,  -- NULL if not on waitlist
  isWaitlistPromoted BOOLEAN DEFAULT false,
  updatedAt TIMESTAMPTZ,
  UNIQUE(sessionId, memberId)
);
```

---

### 10. **waitlist_entries** - Waitlist Management
Explicit waitlist tracking for automatic promotion.

```sql
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY,
  sessionId UUID FOREIGN KEY REFERENCES class_sessions,
  memberId UUID FOREIGN KEY REFERENCES members,
  position INTEGER,
  notifiedAt TIMESTAMPTZ,
  promotedAt TIMESTAMPTZ,
  expiresAt TIMESTAMPTZ,  -- Offer expires after 24h
  createdAt TIMESTAMPTZ,
  UNIQUE(sessionId, memberId)
);
```

---

### 11. **payments** - Billing & Transactions
Complete payment history for revenue tracking.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  memberId UUID FOREIGN KEY REFERENCES members,
  subscriptionId UUID FOREIGN KEY REFERENCES membership_subscriptions,
  amount NUMERIC(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM ('pending', 'succeeded', 'failed', 'refunded', 'disputed'),
  type ENUM ('subscription', 'one_time', 'refund', 'commission', 'merchandise'),
  stripePaymentIntentId VARCHAR(255),
  stripeChargeId VARCHAR(255),
  description VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  refundedAmount NUMERIC(10,2) DEFAULT 0,
  failureReason VARCHAR(255),
  createdAt TIMESTAMPTZ
);
```

**Indexes:**
- `idx_payments_member` - Member payment history
- `idx_payments_gym` - Gym revenue reports
- `idx_payments_stripe` - Stripe reconciliation

**High Volume Note:** Consider time-based partitioning by createdAt for large gyms.

---

### 12. **check_ins** - Attendance Tracking
Member check-in records for capacity and attendance analytics.

```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY,
  memberId UUID FOREIGN KEY REFERENCES members,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  method ENUM ('qr_code', 'manual', 'app', 'card'),
  checkInTime TIMESTAMPTZ DEFAULT NOW(),
  checkOutTime TIMESTAMPTZ,
  bookingId UUID FOREIGN KEY REFERENCES bookings,
  deviceInfo VARCHAR(255),  -- Browser/device info
  staffId UUID FOREIGN KEY REFERENCES users,
  createdAt TIMESTAMPTZ
);
```

**Indexes:**
- `idx_checkins_member` - Member attendance history
- `idx_checkins_gym_time` - Current occupancy tracking
- `idx_checkins_date` - Daily attendance reports

**High Volume Note:** This table grows rapidly; consider archival strategy.

---

### 13. **exercises** - Exercise Library
Master list of exercises with form guidance.

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  muscleGroup VARCHAR(50),  -- 'Chest', 'Back', 'Legs', etc.
  equipment VARCHAR(100),
  difficulty ENUM ('beginner', 'intermediate', 'advanced'),
  videoUrl VARCHAR(500),
  imageUrls JSONB DEFAULT '[]',
  instructions TEXT,
  tips TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ
);
```

---

### 14. **workout_plans** - Custom Training Programs
Trainer-created or template workout programs.

```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY,
  trainerId UUID FOREIGN KEY REFERENCES users,
  memberId UUID FOREIGN KEY REFERENCES members,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  name VARCHAR(100),
  description TEXT,
  difficulty ENUM ('beginner', 'intermediate', 'advanced'),
  durationWeeks INTEGER,
  sessionsPerWeek INTEGER,
  isTemplate BOOLEAN DEFAULT false,  -- Reusable template
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ
);
```

---

### 15. **plan_exercises** - Workout Exercise Details
Junction table linking exercises to workout plans.

```sql
CREATE TABLE plan_exercises (
  id UUID PRIMARY KEY,
  planId UUID FOREIGN KEY REFERENCES workout_plans,
  exerciseId UUID FOREIGN KEY REFERENCES exercises,
  dayNumber INTEGER,  -- 1-7 for Mon-Sun
  orderIndex INTEGER,  -- Position within day
  sets INTEGER,
  reps VARCHAR(20),  -- '8-12', '3 x 8'
  restSeconds INTEGER DEFAULT 60,
  notes TEXT
);
```

---

### 16. **member_progress** - Body Metrics Tracking
Historical progress tracking for members.

```sql
CREATE TABLE member_progress (
  id UUID PRIMARY KEY,
  memberId UUID FOREIGN KEY REFERENCES members,
  recordedAt TIMESTAMPTZ DEFAULT NOW(),
  weightKg NUMERIC(5,2),
  bodyFatPct NUMERIC(5,2),
  muscleMassKg NUMERIC(5,2),
  bmi NUMERIC(4,1),
  chestCm NUMERIC(5,1),
  waistCm NUMERIC(5,1),
  hipsCm NUMERIC(5,1),
  armsCm NUMERIC(5,1),
  thighsCm NUMERIC(5,1),
  notes TEXT,
  photoFrontUrl VARCHAR(500),
  photoSideUrl VARCHAR(500),
  photoBackUrl VARCHAR(500)
);
```

---

### 17. **notifications** - Communication Audit Trail
All sent/failed notifications for compliance.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  recipientId UUID FOREIGN KEY REFERENCES users,
  gymId UUID FOREIGN KEY REFERENCES gyms,
  type ENUM ('email', 'sms', 'push', 'in_app'),
  templateKey VARCHAR(100),  -- 'booking_reminder', 'payment_failed', etc.
  subject VARCHAR(255),
  content TEXT,
  status ENUM ('pending', 'sent', 'failed', 'bounced'),
  sentAt TIMESTAMPTZ,
  openedAt TIMESTAMPTZ,
  errorMessage TEXT,
  metadata JSONB DEFAULT '{}',
  createdAt TIMESTAMPTZ
);
```

---

## Query Patterns

### Frequent Queries

#### 1. Get member's bookings for upcoming week
```sql
SELECT b.* FROM bookings b
JOIN class_sessions cs ON b.sessionId = cs.id
WHERE b.memberId = $1
  AND cs.startTime BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  AND b.status IN ('confirmed', 'attended');
```

#### 2. Get available slots for a class
```sql
SELECT 
  cs.*,
  (cs.maxCapacity - cs.currentBookings) as spotsAvailable,
  wle.position as waitlistPosition
FROM class_sessions cs
LEFT JOIN waitlist_entries wle ON wle.sessionId = cs.id AND wle.memberId = $1
WHERE cs.id = $2
  AND cs.status = 'scheduled';
```

#### 3. Calculate gym revenue for period
```sql
SELECT 
  DATE_TRUNC('month', p.createdAt) as month,
  p.currency,
  SUM(CASE WHEN p.status = 'succeeded' THEN p.amount ELSE 0 END) as revenue,
  COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failedCount
FROM payments p
WHERE p.gymId = $1
  AND p.createdAt BETWEEN $2 AND $3
GROUP BY DATE_TRUNC('month', p.createdAt), p.currency;
```

#### 4. Get attendance analytics
```sql
SELECT 
  DATE_TRUNC('day', ci.checkInTime) as day,
  cs.id as classId,
  COUNT(*) as attendanceCount
FROM check_ins ci
JOIN bookings b ON ci.bookingId = b.id
JOIN class_sessions cs ON b.sessionId = cs.id
WHERE ci.gymId = $1
  AND ci.checkInTime BETWEEN $2 AND $3
GROUP BY DATE_TRUNC('day', ci.checkInTime), cs.id;
```

---

## Performance Optimization

### Partitioning Strategy (for scale)

**Partition payments by month:**
```sql
CREATE TABLE payments_2024_01 PARTITION OF payments
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**Partition check_ins by week:**
```sql
CREATE TABLE check_ins_2024_w01 PARTITION OF check_ins
FOR VALUES FROM ('2024-01-01') TO ('2024-01-08');
```

### Caching Strategy (Redis)

- Cache gym settings for 1 hour
- Cache exercise library for 24 hours
- Cache member profile for 30 minutes
- Cache class schedule for 5 minutes (high churn)
- Cache occupancy counts for 1 minute

---

## Migration Strategy

### Running Migrations

```bash
# Development
npm run db:migrate

# Rollback one migration
npm run db:migrate:revert

# Generate new migration
npm run db:generate-migration -- -n YourMigrationName
```

### Production Deployment

1. Backup production database
2. Run migrations on staging environment first
3. Verify all queries work on new schema
4. Schedule maintenance window
5. Run migrations on production
6. Verify application functionality
7. Monitor error rates for 24 hours

---

## Constraints & Validation

### Database-Level Constraints

- All `email` fields are unique within gym
- `slug` is globally unique
- Booking entries are unique per session/member
- Waitlist entries are unique per session/member
- No booking can exist after member membership ends

### Application-Level Validation

- Email format validation
- Password strength requirements
- Date range validation for subscriptions
- Capacity constraints for bookings
- Referral code uniqueness

---

## Data Lifecycle

### Member Data Retention
- Active members: Keep all data
- Cancelled members: Soft delete (status = 'deleted')
- Data retention period: 7 years (compliance)
- Archive old check-ins/payments to cold storage after 2 years

### Automatic Cleanup
- Delete expired waitlist entries after 24 hours
- Mark failed payment records as archived after 90 days
- Clean up orphaned temporary records monthly

---

## Backup & Recovery

### Backup Schedule
- Daily incremental backups
- Weekly full backups
- Monthly archive to cold storage
- Retain backups for 90 days

### Recovery Procedures
- Point-in-time recovery available for 30 days
- Test recovery procedures monthly
- Document recovery SLA: 1 hour RTO, 15 min RPO

---

## Monitoring

### Key Metrics
- Table sizes and growth rate
- Query performance (slow query log)
- Index usage and fragmentation
- Replication lag (if applicable)
- Backup completion status

### Alerts
- Query time > 1 second
- Table size growth > 50% month-over-month
- Replication lag > 5 seconds
- Failed backups
