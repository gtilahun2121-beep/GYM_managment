import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
  Param,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  SetupMFADto,
  VerifyMFADto
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { EmailService } from './services/email.service';
import { MFAService } from './services/mfa.service';
import { TokenService } from './services/token.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly mfaService: MFAService,
    private readonly tokenService: TokenService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new member account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);

    // Send verification email
    const verificationToken = this.tokenService.generateEmailVerificationToken(
      user.id,
      user.email,
      registerDto.gymId
    );

    const verificationLink = `${process.env.WEB_URL}/verify-email?token=${verificationToken}`;
    await this.emailService.sendEmailVerification(user.email, user.id, verificationLink);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login and receive access/refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    // If MFA is enabled, don't return access token yet
    if (result.user.mfaEnabled) {
      return {
        requiresMFA: true,
        // mfaToken: result.mfaToken,
        message: 'Please provide your MFA code'
      };
    }

    return result;
  }

  @Post('verify-mfa')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify MFA code to complete login' })
  async verifyMFA(@Body() verifyMFADto: VerifyMFADto) {
    return this.authService.verifyMFAForLogin(
      verifyMFADto.mfaToken,
      verifyMFADto.code
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  async getCurrentUser(@CurrentUser() user: any) {
    const fullUser = await this.authService.getUserById(user.userId);
    const { passwordHash, mfaSecret, ...userWithoutSensitive } = fullUser;
    return userWithoutSensitive;
  }

  @Post('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify email with token from email link' })
  async verifyEmailToken(@Body() verifyEmailDto: VerifyEmailDto) {
    const decoded = this.tokenService.verifyToken(
      verifyEmailDto.token,
      'email-verification'
    );

    await this.authService.verifyEmail(decoded.userId);
    this.tokenService.revokeToken(verifyEmailDto.token);

    return { message: 'Email verified successfully' };
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.authService.findUserByEmail(
      forgotPasswordDto.email,
      forgotPasswordDto.gymId
    );

    if (!user) {
      // Don't reveal whether email exists
      return {
        message: 'If an account exists, you will receive a password reset email'
      };
    }

    const resetToken = this.tokenService.generatePasswordResetToken(
      user.id,
      user.email,
      user.gymId
    );

    const resetLink = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordReset(user.email, resetLink, 30);

    return {
      message: 'Password reset email sent if account exists'
    };
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const decoded = this.tokenService.verifyToken(
      resetPasswordDto.token,
      'password-reset'
    );

    await this.authService.resetPassword(decoded.userId, resetPasswordDto.newPassword);
    this.tokenService.revokeToken(resetPasswordDto.token);

    return { message: 'Password reset successfully' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Change password (requires current password)' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: any
  ) {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.authService.changePassword(
      user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );

    return { message: 'Password changed successfully' };
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize MFA setup (get QR code)' })
  async setupMFA(@CurrentUser() user: any) {
    const fullUser = await this.authService.getUserById(user.userId);
    const setupData = await this.mfaService.generateMFASetup(
      fullUser.email,
      user.gymId
    );

    return setupData;
  }

  @Post('mfa/verify-setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify MFA setup and enable it' })
  async verifyMFASetup(
    @Body() setupMFADto: SetupMFADto,
    @CurrentUser() user: any
  ) {
    await this.mfaService.enableMFA(
      user.userId,
      setupMFADto.secret,
      setupMFADto.verificationCode
    );

    return {
      message: 'MFA enabled successfully',
      backupCodes: setupMFADto.backupCodes
    };
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Disable MFA' })
  async disableMFA(
    @Body('password') password: string,
    @CurrentUser() user: any
  ) {
    await this.mfaService.disableMFA(user.userId, password);

    const fullUser = await this.authService.getUserById(user.userId);
    await this.emailService.sendMFADisabled(fullUser.email);

    return { message: 'MFA disabled successfully' };
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('userId') userId: string, @CurrentUser() user: any) {
    const requestedUser = await this.authService.getUserById(userId);

    // Users can only view their own data unless they're admin
    if (user.userId !== userId && user.role !== 'gym_manager' && user.role !== 'super_admin') {
      throw new UnauthorizedException('Cannot access other users data');
    }

    const { passwordHash, mfaSecret, ...userWithoutSensitive } = requestedUser;
    return userWithoutSensitive;
  }
}
