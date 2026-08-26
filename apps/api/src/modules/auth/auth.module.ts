import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { EmailService } from './services/email.service';
import { MFAService } from './services/mfa.service';
import { TokenService } from './services/token.service';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key-change-in-prod'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRE_IN', '15m')
        }
      })
    }),
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    EmailService,
    MFAService,
    TokenService
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    PassportModule,
    JwtModule,
    EmailService,
    MFAService,
    TokenService
  ]
})
export class AuthModule {}
