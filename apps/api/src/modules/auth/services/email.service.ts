import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT', 587);
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('Email configuration incomplete - emails will not be sent');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    this.logger.log('Email service initialized');
  }

  async send(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured - skipping send');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@gym-system.com'),
        ...options
      });

      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      throw new BadRequestException('Failed to send email');
    }
  }

  /**
   * Send email verification link
   */
  async sendEmailVerification(email: string, userId: string, verificationLink: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Verify your email address',
      html: `
        <h2>Welcome to Gym Management System!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
      text: `Verify your email: ${verificationLink}`
    });
  }

  /**
   * Send password reset link
   */
  async sendPasswordReset(email: string, resetLink: string, expiryMinutes: number): Promise<void> {
    await this.send({
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #EF4444; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in ${expiryMinutes} minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
      text: `Reset your password: ${resetLink}`
    });
  }

  /**
   * Send MFA setup confirmation
   */
  async sendMFASetup(email: string, confirmationLink: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Confirm two-factor authentication setup',
      html: `
        <h2>Two-Factor Authentication Setup</h2>
        <p>You've requested to enable two-factor authentication on your account.</p>
        <p>Click the link below to confirm:</p>
        <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px;">
          Confirm Setup
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Confirm MFA setup: ${confirmationLink}`
    });
  }

  /**
   * Send MFA disabled confirmation
   */
  async sendMFADisabled(email: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Two-factor authentication disabled',
      html: `
        <h2>Two-Factor Authentication Disabled</h2>
        <p>Two-factor authentication has been disabled on your account.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `,
      text: 'Two-factor authentication has been disabled on your account.'
    });
  }

  /**
   * Send suspicious login alert
   */
  async sendSuspiciousLogin(email: string, ipAddress: string, location: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Suspicious login activity detected',
      html: `
        <h2>Security Alert</h2>
        <p>A login attempt was made on your account from an unusual location:</p>
        <ul>
          <li><strong>IP Address:</strong> ${ipAddress}</li>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Time:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p>If this wasn't you, please change your password immediately.</p>
      `,
      text: `Suspicious login from ${ipAddress} (${location})`
    });
  }
}
