import { IsString, IsEmail, MinLength, IsUUID, IsOptional, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsUUID()
  gymId: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[^\s]{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character'
  })
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsUUID()
  gymId?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[^\s]{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character'
  })
  newPassword: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsUUID()
  gymId: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[^\s]{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character'
  })
  newPassword: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class SetupMFADto {
  @IsString()
  secret: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits' })
  verificationCode: string;

  backupCodes: string[];
}

export class VerifyMFADto {
  @IsString()
  mfaToken: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'MFA code must be 6 digits' })
  code: string;
}

export class AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
