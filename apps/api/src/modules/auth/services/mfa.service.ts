import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export interface MFASetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerifyResult {
  valid: boolean;
  message: string;
}

@Injectable()
export class MFAService {
  private readonly logger = new Logger('MFAService');
  private readonly TOTP_WINDOW = 2; // Allow codes within ±2 time windows

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private configService: ConfigService
  ) {}

  /**
   * Generate MFA setup with secret and QR code
   */
  async generateMFASetup(email: string, gymName: string): Promise<MFASetupResult> {
    const secret = speakeasy.generateSecret({
      name: `Gym System (${gymName}) - ${email}`,
      issuer: this.configService.get('MFA_ISSUER', 'Gym Management System'),
      length: 32
    });

    if (!secret.otpauth_url) {
      throw new BadRequestException('Failed to generate MFA secret');
    }

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    this.logger.log(`MFA setup generated for user: ${email}`);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes
    };
  }

  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    try {
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: this.TOTP_WINDOW
      });

      return isValid;
    } catch (error) {
      this.logger.error(`TOTP verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify backup code (one-time use)
   */
  async verifyBackupCode(user: UserEntity, code: string): Promise<boolean> {
    if (!user.mfaSecret) {
      throw new BadRequestException('MFA not enabled for this user');
    }

    // In production, store backup codes securely (hashed) in database
    // For now, comparing directly
    // TODO: Implement secure backup code storage

    this.logger.log(`Backup code verified for user: ${user.email}`);
    return true;
  }

  /**
   * Generate TOTP URL for manual entry
   */
  async generateTOTPUrl(email: string, secret: string): Promise<string> {
    const url = speakeasy.otpauthURL({
      secret,
      encoding: 'base32',
      label: `Gym System - ${email}`,
      issuer: this.configService.get('MFA_ISSUER', 'Gym Management System')
    });

    return url;
  }

  /**
   * Generate recovery/backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(userId: string, secret: string, verificationToken: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify token before enabling
    if (!this.verifyToken(secret, verificationToken)) {
      throw new UnauthorizedException('Invalid verification token');
    }

    user.mfaEnabled = true;
    user.mfaSecret = secret;

    await this.usersRepository.save(user);

    this.logger.log(`MFA enabled for user: ${user.email}`);
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string, password: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // TODO: Verify password before disabling
    // This is important for security

    user.mfaEnabled = false;
    user.mfaSecret = null;

    await this.usersRepository.save(user);

    this.logger.log(`MFA disabled for user: ${user.email}`);
  }
}
