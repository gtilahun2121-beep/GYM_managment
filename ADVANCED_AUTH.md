# Advanced Authentication Features

## Email Verification

### Overview
All new registrations require email verification. A verification link is sent to the user's email and must be clicked within 24 hours.

### Registration Flow

```
1. User registers via POST /auth/register
2. Account created with status: active, emailVerified: false
3. Verification email sent with unique token link
4. User clicks link: /verify-email?token=<verification-token>
5. Token verified and decoded
6. User account marked with emailVerified: true
7. Token revoked (added to blacklist)
```

### Endpoints

#### Send Verification Email
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "gymId": "gym-uuid"
}

Response 201:
{
  "id": "user-uuid",
  "email": "user@example.com",
  "message": "Registration successful. Please check your email to verify your account."
}
```

#### Verify Email with Token
```bash
POST /auth/verify-email
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Response 200:
{
  "message": "Email verified successfully"
}
```

### Token Management

**Email Verification Token:**
- **Duration**: 24 hours (configurable via `EMAIL_VERIFICATION_EXPIRY`)
- **Single Use**: Yes (revoked after verification)
- **Contains**: User ID, email, gym ID, token type, JTI (unique ID)
- **Signature**: HS256 with JWT_SECRET

### Implementation

```typescript
// Generate verification token
const verificationToken = this.tokenService.generateEmailVerificationToken(
  userId,
  email,
  gymId
);

// Create link
const verificationLink = `${process.env.WEB_URL}/verify-email?token=${verificationToken}`;

// Send email
await this.emailService.sendEmailVerification(email, userId, verificationLink);

// Verify token
const decoded = this.tokenService.verifyToken(token, 'email-verification');
await this.authService.verifyEmail(decoded.userId);
this.tokenService.revokeToken(token);
```

---

## Password Reset

### Overview
Users can request password reset via email. A secure, time-limited reset link is sent that allows them to set a new password without knowing the old one.

### Password Reset Flow

```
1. User clicks "Forgot Password"
2. Enters email: POST /auth/forgot-password
3. System finds user by email
4. Password reset token generated (30 min expiry)
5. Email sent with reset link
6. User clicks link: /reset-password?token=<reset-token>
7. User enters new password
8. Sends POST /auth/reset-password with new password + token
9. Token verified, password updated, token revoked
10. Confirmation email sent
```

### Endpoints

#### Request Password Reset
```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com",
  "gymId": "gym-uuid"
}

Response 200:
{
  "message": "If an account exists, you will receive a password reset email"
}
```

Note: Response is same whether email exists or not (security practice).

#### Reset Password with Token
```bash
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "NewSecurePass123!"
}

Response 200:
{
  "message": "Password reset successfully"
}
```

### Token Management

**Password Reset Token:**
- **Duration**: 30 minutes (configurable via `PASSWORD_RESET_EXPIRY`)
- **Single Use**: Yes (revoked after use)
- **Contains**: User ID, email, gym ID, token type, JTI
- **Signature**: HS256 with JWT_SECRET

### Implementation

```typescript
// Generate reset token
const resetToken = this.tokenService.generatePasswordResetToken(userId, email, gymId);

// Create reset link
const resetLink = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;

// Send email
await this.emailService.sendPasswordReset(email, resetLink, 30);

// Verify and reset password
const decoded = this.tokenService.verifyToken(token, 'password-reset');
await this.authService.resetPassword(decoded.userId, newPassword);
this.tokenService.revokeToken(token);
```

---

## Password Management

### Change Password (Authenticated)
User can change their password while logged in by providing current password.

```bash
POST /auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}

Response 200:
{
  "message": "Password changed successfully"
}
```

### Password Requirements

All passwords must meet these criteria:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

**Examples:**
- ✅ `SecurePass123!` - Valid
- ✅ `MyPassword@456` - Valid
- ❌ `password123` - No uppercase
- ❌ `Password123` - No special character
- ❌ `Pass1!` - Too short

---

## Multi-Factor Authentication (MFA)

### Overview
MFA adds an extra layer of security using Time-based One-Time Passwords (TOTP). Users scan a QR code with Google Authenticator or similar app to enable MFA.

### TOTP Implementation

**Algorithm**: RFC 6238 (Time-based One-Time Passwords)
**Algorithm Type**: HMAC-SHA1
**Time Step**: 30 seconds
**Digits**: 6
**Window**: ±2 time steps (60 seconds tolerance)

### MFA Setup Flow

```
1. User initiates MFA setup: POST /auth/mfa/setup
2. Server generates random secret (32 bytes)
3. QR code generated with secret embedded
4. User scans QR code with authenticator app
5. App shows 6-digit code
6. User verifies code: POST /auth/mfa/verify-setup
7. Code validated against secret
8. MFA enabled on account
9. Backup codes provided to user
```

### MFA Login Flow

```
1. User logs in: POST /auth/login with email + password
2. Credentials verified
3. If MFA enabled:
   a. Generate temporary MFA token (short-lived)
   b. Return { requiresMFA: true, mfaToken }
4. User enters 6-digit code from authenticator app
5. Verify code: POST /auth/verify-mfa with mfaToken + code
6. If valid, return accessToken + refreshToken
```

### Endpoints

#### Initiate MFA Setup
```bash
POST /auth/mfa/setup
Authorization: Bearer <accessToken>

Response 200:
{
  "secret": "BASE32-ENCODED-SECRET",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["XXXXXXXX", "XXXXXXXX", ...]
}
```

#### Verify MFA Setup (Enable MFA)
```bash
POST /auth/mfa/verify-setup
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "secret": "BASE32-ENCODED-SECRET",
  "verificationCode": "123456",
  "backupCodes": ["XXXXXXXX", ...]
}

Response 200:
{
  "message": "MFA enabled successfully",
  "backupCodes": ["XXXXXXXX", ...]
}
```

**Important**: Save backup codes in a secure location. They can be used if you lose access to your authenticator app.

#### Login with MFA
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "gymId": "gym-uuid"
}

Response 200 (MFA Required):
{
  "requiresMFA": true,
  "mfaToken": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Please provide your MFA code"
}
```

#### Verify MFA Code
```bash
POST /auth/verify-mfa
Content-Type: application/json

{
  "mfaToken": "eyJhbGciOiJIUzI1NiIs...",
  "code": "123456"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "member"
  }
}
```

#### Disable MFA
```bash
POST /auth/mfa/disable
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "password": "SecurePass123!"
}

Response 200:
{
  "message": "MFA disabled successfully"
}
```

### Backup Codes

If you lose access to your authenticator app:

1. Use a backup code instead of the 6-digit code
2. Format: Usually 8 characters (e.g., `ABC12345`)
3. Each code is **one-time use only**
4. Cannot regenerate backup codes without MFA app access
5. Store in secure location (password manager, safe, etc.)

### Authenticator Apps

Compatible apps for generating 6-digit codes:
- **Google Authenticator** (iOS, Android)
- **Microsoft Authenticator** (iOS, Android)
- **Authy** (iOS, Android, Mac, Windows)
- **1Password** (iOS, Android, Mac, Windows)
- **LastPass Authenticator** (iOS, Android)
- **FreeOTP+** (Android)

### Implementation

```typescript
// Generate MFA setup
const setupData = await this.mfaService.generateMFASetup(email, gymName);
// Returns: { secret, qrCode, backupCodes }

// Enable MFA
await this.mfaService.enableMFA(userId, secret, verificationCode);

// Verify TOTP code
const isValid = this.mfaService.verifyToken(secret, code);

// Disable MFA
await this.mfaService.disableMFA(userId, password);
```

---

## Email Service

### Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@gym-system.com
```

### Gmail Setup

1. Enable 2-factor authentication on your Google Account
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Use the generated password in `SMTP_PASS`
4. Set `SMTP_USER` to your full Gmail address

### Email Templates

All emails include:
- Professional HTML formatting
- Plain text fallback
- Clear call-to-action buttons
- Security information
- Unsubscribe/support links (future)

### Supported Email Types

- **Email Verification** - Confirm new email address
- **Password Reset** - Secure password reset link
- **MFA Setup Confirmation** - Confirm MFA enablement
- **MFA Disabled Alert** - Notify user of MFA disable
- **Suspicious Login Alert** - Alert on unusual access

---

## Security Best Practices

### Token Security

1. **Token Storage**
   - Access tokens in memory (React state/Zustand)
   - Refresh tokens in `httpOnly` cookies
   - Never store tokens in localStorage

2. **Token Expiration**
   - Access tokens: 15 minutes (short-lived)
   - Refresh tokens: 7 days (long-lived)
   - Special tokens: 24h-30m depending on purpose

3. **Token Rotation**
   - New refresh token issued on each refresh
   - Old tokens can be revoked

4. **Signature Verification**
   - All tokens signed with HS256
   - Verified on every request
   - Invalid signatures immediately rejected

### Rate Limiting

Prevent brute force attacks:
- **Login attempts**: 5 failures = 15 min lockout
- **Password reset requests**: 3 per hour per email
- **MFA verification**: 3 failures = 15 min delay
- **Email verification**: 5 resends per hour

### Password Security

1. **Hashing**: bcrypt with cost factor 12
2. **Never Log**: Passwords never logged or transmitted
3. **Reset Only**: Forgotten passwords can be reset, not retrieved
4. **Strength**: Enforced requirements (uppercase, lowercase, number, special char)
5. **History**: Track last 5 passwords (prevent reuse) - *Future enhancement*

### Email Security

1. **Verification Required**: All new emails require verification
2. **Change Notification**: User notified when email is changed
3. **Secure Links**: Time-limited, single-use tokens
4. **Expiration**: Links expire after 24h for verification, 30m for reset
5. **Rate Limiting**: Prevent email bombing

### MFA Security

1. **Algorithm**: RFC 6238 with 30-second windows
2. **Code Length**: 6 digits (1 million combinations)
3. **Time Sync**: Allows ±2 windows (60 second tolerance)
4. **Backup Codes**: Securely stored, single-use
5. **No Recovery**: Cannot disable without password verification

---

## Troubleshooting

### Email Not Received

**Check:**
1. Email address is correct (case-insensitive)
2. Email not in spam/junk folder
3. SMTP configuration is correct
4. Gmail app password is valid (if using Gmail)
5. Check server logs for SMTP errors

### MFA Not Working

**Check:**
1. Phone time is correct (within 30 seconds)
2. App is scanning correct QR code
3. Secret hasn't changed since setup
4. Using correct 6-digit code
5. Not using expired backup code

### Token Expired

**Solution:**
1. Login again to get new tokens
2. Use refresh token to get new access token
3. Check system clock is synchronized

### Can't Reset Password

**Check:**
1. Email is registered in the system
2. Reset link hasn't expired (30 minutes)
3. Token hasn't been used already (single-use)
4. Email domain is not blacklisted

---

## Environment Variables

```env
# Email Verification
EMAIL_VERIFICATION_ENABLED=true
EMAIL_VERIFICATION_EXPIRY=24h

# Password Reset
PASSWORD_RESET_EXPIRY=30m

# MFA
MFA_ENABLED=true
MFA_ISSUER=Gym Management System

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@gym-system.com

# Web URLs
WEB_URL=http://localhost:3001
APP_URL=http://localhost:3000
```

---

## Future Enhancements

- [ ] OAuth 2.0 / Social login (Google, Facebook)
- [ ] Biometric authentication (fingerprint, face)
- [ ] WebAuthn / FIDO2 support
- [ ] Passwordless login via email link
- [ ] Session management per device
- [ ] Suspicious activity detection
- [ ] Login attempt history
- [ ] Geo-location based alerts
- [ ] Password strength meter
- [ ] Compromised password detection
