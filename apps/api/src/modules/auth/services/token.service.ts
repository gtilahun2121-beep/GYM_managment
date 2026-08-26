import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'email-verification' | 'password-reset' | 'mfa-setup';
  gymId: string;
}

export interface DecryptedToken {
  userId: string;
  email: string;
  type: string;
  gymId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger('TokenService');

  // In-memory token blacklist (use Redis in production)
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(userId: string, email: string, gymId: string): string {
    const token = this.jwtService.sign(
      {
        userId,
        email,
        type: 'email-verification',
        gymId,
        jti: uuid() // Unique token ID for revocation
      } as TokenPayload,
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('EMAIL_VERIFICATION_EXPIRY', '24h')
      }
    );

    this.logger.log(`Email verification token generated for: ${email}`);
    return token;
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(userId: string, email: string, gymId: string): string {
    const token = this.jwtService.sign(
      {
        userId,
        email,
        type: 'password-reset',
        gymId,
        jti: uuid()
      } as TokenPayload,
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('PASSWORD_RESET_EXPIRY', '30m')
      }
    );

    this.logger.log(`Password reset token generated for: ${email}`);
    return token;
  }

  /**
   * Generate MFA setup token
   */
  generateMFASetupToken(userId: string, email: string, gymId: string): string {
    const token = this.jwtService.sign(
      {
        userId,
        email,
        type: 'mfa-setup',
        gymId,
        jti: uuid()
      } as TokenPayload,
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h'
      }
    );

    this.logger.log(`MFA setup token generated for: ${email}`);
    return token;
  }

  /**
   * Verify special purpose token
   */
  verifyToken(token: string, expectedType: string): DecryptedToken {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET')
      }) as DecryptedToken;

      if (decoded.type !== expectedType) {
        throw new UnauthorizedException(
          `Invalid token type. Expected ${expectedType}, got ${decoded.type}`
        );
      }

      // Check if token is blacklisted
      if (this.tokenBlacklist.has(token)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Revoke token (add to blacklist)
   */
  revokeToken(token: string): void {
    this.tokenBlacklist.add(token);
    this.logger.log('Token revoked');

    // In production, also store in Redis with TTL
    // For now, we'll clear the blacklist every hour to prevent memory leak
    setTimeout(() => {
      this.tokenBlacklist.clear();
    }, 3600000);
  }

  /**
   * Extract token from header
   */
  extractTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    return authHeader.substring(7);
  }

  /**
   * Validate token format
   */
  isValidTokenFormat(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3;
  }
}
