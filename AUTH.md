# Authentication & Authorization System

## Overview

The Gym Management System implements a complete JWT-based authentication and authorization system with role-based access control (RBAC) and comprehensive permission management.

## Architecture

### Token Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/login (email + password)
       ▼
┌─────────────────────────────────────┐
│       Auth Service                  │
│  - Hash password check (bcrypt)     │
│  - Generate JWT tokens              │
│  - Store refresh token              │
└──────┬──────────────────────────────┘
       │ 2. Return { accessToken, refreshToken }
       ▼
┌──────────────────────────────┐
│   Client Stores              │
│  - accessToken (memory)      │
│  - refreshToken (httpOnly)   │
└──────┬───────────────────────┘
       │ 3. Authorization: Bearer <accessToken>
       ▼
┌──────────────────────────────┐
│   JWT Auth Guard             │
│  - Verify signature          │
│  - Check expiration          │
│  - Extract user info         │
└──────┬───────────────────────┘
       │ 4. Attach user to request
       ▼
┌──────────────────────────────┐
│   Roles Guard (if needed)    │
│  - Check user.role           │
│  - Verify permissions        │
└──────┬───────────────────────┘
       │ 5. Allow/Deny
       ▼
┌──────────────────────────────┐
│   Controller Action          │
│  - Access @CurrentUser()     │
│  - Process request           │
└──────────────────────────────┘
```

## User Roles

### Role Hierarchy

```
super_admin (top)
    │
    ├─→ gym_manager
    │      │
    │      ├─→ receptionist
    │      └─→ trainer
    │
    └─→ member (bottom)
```

### Role Permissions

#### Super Admin
- **System-wide access**
- Manage all gyms
- Manage all users
- View all analytics
- System configuration

```typescript
'users:*', 'gyms:*', 'members:*', 'classes:*', 'bookings:*', 'payments:*'
```

#### Gym Manager
- **Gym-specific management**
- Manage staff within gym
- View gym analytics
- Manage classes and schedules
- Process refunds

```typescript
'gyms:read', 'users:*', 'members:*', 'classes:*', 'payments:*', 'admin:read'
```

#### Receptionist
- **Front desk operations**
- Check in members
- Create/cancel bookings
- View member info
- Basic admin access

```typescript
'members:read', 'bookings:*', 'checkins:*', 'classes:read'
```

#### Trainer
- **Training management**
- Manage own classes
- Create workout plans
- Track client progress
- View class bookings

```typescript
'classes:update-own', 'workouts:*', 'progress:*', 'bookings:read'
```

#### Member
- **Self-service access**
- Book classes
- View own profile
- Track own progress
- View own payments

```typescript
'profile:update-own', 'bookings:*', 'progress:create-own', 'payments:read'
```

## Implementation Guide

### 1. Authentication Endpoints

#### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "member@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "gymId": "gym-uuid",
  "phoneNumber": "+1-555-0123"
}

Response 201:
{
  "id": "user-uuid",
  "email": "member@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "member"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "member@example.com",
  "password": "SecurePass123!",
  "gymId": "gym-uuid"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "user-uuid",
    "email": "member@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member",
    "gymId": "gym-uuid"
  }
}
```

#### Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

#### Get Current User
```bash
GET /auth/me
Authorization: Bearer <accessToken>

Response 200:
{
  "id": "user-uuid",
  "email": "member@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "member",
  "status": "active",
  "emailVerified": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 2. Using Guards and Decorators

#### Public Endpoint (No Auth Required)
```typescript
@Get('public')
public() {
  return { message: 'Public endpoint' };
}
```

#### Authenticated Endpoint
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
getProfile(@CurrentUser() user: CurrentUserType) {
  return { userId: user.userId, email: user.email };
}
```

#### Role-Based Endpoint
```typescript
@Post('refund')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GYM_MANAGER, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
refundPayment(@Body() body: any, @CurrentUser() user: CurrentUserType) {
  return { message: 'Refund processed' };
}
```

#### Permission-Based Endpoint
```typescript
@Get('admin-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
getAdminData(@CurrentUser() user: CurrentUserType) {
  if (!hasPermission(user.role as UserRole, 'admin:read')) {
    throw new ForbiddenException('Insufficient permissions');
  }
  return { data: 'admin-only' };
}
```

### 3. Access Control Patterns

#### Data Isolation by Gym
```typescript
@Get('members/:id')
@UseGuards(JwtAuthGuard)
async getMember(
  @Param('id') memberId: string,
  @CurrentUser() user: CurrentUserType
) {
  const member = await this.memberService.findById(memberId);

  // Super admin can access any member
  if (user.role === UserRole.SUPER_ADMIN) {
    return member;
  }

  // Gym managers can only access members in their gym
  if (user.gymId !== member.gymId) {
    throw new ForbiddenException('Cannot access members from other gyms');
  }

  return member;
}
```

#### Member Self-Service with Manager Override
```typescript
@Put('profile/:userId')
@UseGuards(JwtAuthGuard)
async updateProfile(
  @Param('userId') userId: string,
  @Body() updateData: any,
  @CurrentUser() user: CurrentUserType
) {
  // Members can only update their own profile
  if (user.role === UserRole.MEMBER && user.userId !== userId) {
    throw new ForbiddenException('Cannot update another member\'s profile');
  }

  // Managers and admins can update any profile
  return this.userService.update(userId, updateData);
}
```

#### Trainer Access Control
```typescript
@Get('classes/:classId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRAINER)
async getClass(
  @Param('classId') classId: string,
  @CurrentUser() user: CurrentUserType
) {
  const classSession = await this.classService.findById(classId);

  // Trainers can only view their own classes
  if (classSession.trainerId !== user.userId) {
    throw new ForbiddenException('You can only view your own classes');
  }

  return classSession;
}
```

## Token Management

### Access Token
- **Duration**: 15 minutes
- **Storage**: Memory (React state)
- **Usage**: Every API request
- **Contains**: User ID, email, gym ID, role

### Refresh Token
- **Duration**: 7 days
- **Storage**: `httpOnly` cookie (automatic refresh)
- **Usage**: To get new access token
- **Contains**: User ID, email, gym ID, role

### Refresh Strategy

```typescript
// Automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/auth/refresh', { refreshToken });

      localStorage.setItem('accessToken', response.data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Password Storage
- Hashed with bcrypt (cost factor: 12)
- Never stored in plain text
- Never logged or transmitted

### Token Security
- Signed with HS256 (HMAC-SHA256)
- Verified on every request
- Expired tokens rejected
- Refresh tokens single-use (in future versions)

### API Security Headers
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### CORS Configuration
```typescript
app.enableCors({
  origin: ['http://localhost:3001', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

## Audit & Compliance

### Audit Logging
Every authentication event is logged:
- Login attempts (success/failure)
- Token generation
- Permission changes
- Sensitive operations

```typescript
this.logger.log(`User logged in: ${email}`);
this.logger.warn(`Failed login attempt for user: ${email}`);
this.logger.error(`Token verification failed: ${error.message}`);
```

### GDPR Compliance
- Users can request account deletion (soft delete)
- Personal data can be exported
- Consent tracking for marketing emails
- Data retention policies enforced

### PCI Compliance
- Card data never stored (Stripe tokens only)
- HTTPS/TLS for all communications
- Security headers enforced
- Regular security audits

## Troubleshooting

### Common Issues

#### "Invalid email or password"
- Check email spelling
- Verify password is correct
- Ensure user exists in the gym
- Check if account is suspended

#### "Token expired"
- Use refresh token endpoint
- Clear local storage and re-login
- Check system clock synchronization

#### "Unauthorized"
- Verify JWT token in Authorization header
- Check if token has expired
- Ensure token is not corrupted
- Try refreshing the token

#### "Forbidden - Insufficient permissions"
- Verify user has required role
- Check if endpoint requires admin access
- Ensure user belongs to correct gym
- Verify permission configuration

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRE_IN=15m
JWT_REFRESH_EXPIRE_IN=7d

# Optional: Email verification (when implemented)
EMAIL_VERIFICATION_ENABLED=true
EMAIL_VERIFICATION_EXPIRY=24h

# Optional: MFA (when implemented)
MFA_ENABLED=false
MFA_ISSUER=Gym Management System
```

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] OAuth 2.0 / Social login
- [ ] Biometric authentication
- [ ] Session management per device
- [ ] Single sign-on (SSO)
- [ ] API key authentication for integrations
- [ ] Role-based scopes with fine-grained access
- [ ] Audit trail dashboard
- [ ] Security policy enforcement

## References

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT.io](https://jwt.io)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
