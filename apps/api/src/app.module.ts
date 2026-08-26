import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { GymsModule } from './modules/gyms/gyms.module';
import { UsersModule } from './modules/users/users.module';
import { MembersModule } from './modules/members/members.module';
import { ClassesModule } from './modules/classes/classes.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CheckInsModule } from './modules/check-ins/check-ins.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    DatabaseModule,
    AuthModule,
    GymsModule,
    UsersModule,
    MembersModule,
    ClassesModule,
    BookingsModule,
    PaymentsModule,
    CheckInsModule,
    WorkoutsModule,
    NotificationsModule,
    AnalyticsModule
  ]
})
export class AppModule {}
