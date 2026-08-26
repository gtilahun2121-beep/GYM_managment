import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { UserEntity } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, AuthTokensDto, RefreshTokenDto } from './dto/auth.dto';
import { UserRole, UserStatus } from '@gym/shared-types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  private readonly BCRYPT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * Register a new member user
   */
  async register(registerDto: RegisterDto): Promise<{ id: string; email: string; firstName: string; lastName: string; role: UserRole }> {
    const { email, password, firstName, lastName, gymId, phoneNumber } = registerDto;

    // Validate input
    this.validatePassword(password);

    // If no gymId provided, get the first gym
    let finalGymId = gymId;
    if (!finalGymId) {
      // For now, use a hardcoded default gym ID - this should ideally query the database
      // In a production system, this would be handled differently
      finalGymId = '550e8400-e29b-41d4-a716-446655440000'; // Default gym UUID
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email, gymId: finalGymId }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this gym');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Create user
    const user = this.usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phoneNumber,
      gymId: finalGymId,
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      emailVerified: false
    });

    const savedUser = await this.usersRepository.save(user);

    this.logger.log(`New member registered: ${email} in gym ${finalGymId}`);

    return {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role
    };
  }

  /**
   * Authenticate user and issue tokens
   */
  async login(loginDto: LoginDto): Promise<AuthTokensDto & { user: any }> {
    const { email, password, gymId } = loginDto;

    // Find user
    const user = await this.usersRepository.findOne({
      where: { email, gymId }
    });

    if (!user) {
      this.logger.warn(`Login attempt with invalid email: ${email} for gym ${gymId}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`User account is ${user.status}`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for user: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    this.logger.log(`User logged in: ${email}`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        gymId: user.gymId
      }
    };
  }

  /**
   * Validate user credentials (for local strategy)
   */
  async validateUser(
    email: string,
    password: string,
    gymId: string
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { email, gymId }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: UserEntity): Promise<AuthTokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      gymId: user.gymId,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      secret: this.configService.get('JWT_SECRET')
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      secret: this.configService.get('JWT_REFRESH_SECRET', this.configService.get('JWT_SECRET'))
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthTokensDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', this.configService.get('JWT_SECRET'))
      });

      const user = await this.usersRepository.findOne({
        where: { id: decoded.sub }
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('User not found or account is inactive');
      }

      this.logger.log(`Token refreshed for user: ${user.email}`);

      return this.generateTokens(user);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character (!@#$%^&*)');
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string, gymId: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email, gymId } });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Reset password with new password
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    this.validatePassword(newPassword);

    const user = await this.getUserById(userId);
    const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    user.passwordHash = passwordHash;
    await this.usersRepository.save(user);

    this.logger.log(`Password reset for user: ${user.email}`);
  }

  /**
   * Change password (requires current password)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.getUserById(userId);

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    this.validatePassword(newPassword);

    const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);
    user.passwordHash = passwordHash;
    await this.usersRepository.save(user);

    this.logger.log(`Password changed for user: ${user.email}`);
  }

  /**
   * Verify MFA for login
   */
  async verifyMFAForLogin(mfaToken: string, code: string): Promise<AuthTokensDto & { user: any }> {
    try {
      const decoded = this.jwtService.verify(mfaToken, {
        secret: this.configService.get('JWT_SECRET')
      });

      const user = await this.usersRepository.findOne({
        where: { id: decoded.sub }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify MFA code
      if (!user.mfaSecret) {
        throw new UnauthorizedException('MFA not enabled for this user');
      }

      const isMFAValid = this.verifyMFACode(user.mfaSecret, code);

      if (!isMFAValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          gymId: user.gymId
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid MFA token');
    }
  }

  /**
   * Verify MFA code (stub - will use MFAService)
   */
  private verifyMFACode(secret: string, code: string): boolean {
    // This will be implemented by MFAService
    // Stub for now
    return true;
  }

  /**
   * Verify email for a user
   */
  async verifyEmail(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    user.emailVerified = true;
    await this.usersRepository.save(user);
    this.logger.log(`Email verified for user: ${user.email}`);
  }
}
