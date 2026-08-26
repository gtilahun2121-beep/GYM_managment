import { DataSource } from 'typeorm';
import 'dotenv/config';
import { GymEntity } from '../modules/gyms/entities/gym.entity';
import { UserEntity } from '../modules/users/entities/user.entity';
import { MemberEntity } from '../modules/members/entities/member.entity';
import { MembershipPlanEntity } from '../modules/members/entities/membership-plan.entity';
import { MembershipSubscriptionEntity } from '../modules/members/entities/membership-subscription.entity';
import { ClassTypeEntity } from '../modules/classes/entities/class-type.entity';
import { RoomEntity } from '../modules/classes/entities/room.entity';
import { ClassSessionEntity } from '../modules/classes/entities/class-session.entity';
import { BookingEntity } from '../modules/bookings/entities/booking.entity';
import { WaitlistEntryEntity } from '../modules/bookings/entities/waitlist-entry.entity';
import { PaymentEntity } from '../modules/payments/entities/payment.entity';
import { CheckInEntity } from '../modules/check-ins/entities/check-in.entity';
import { ExerciseEntity } from '../modules/workouts/entities/exercise.entity';
import { WorkoutPlanEntity } from '../modules/workouts/entities/workout-plan.entity';
import { PlanExerciseEntity } from '../modules/workouts/entities/plan-exercise.entity';
import { MemberProgressEntity } from '../modules/workouts/entities/member-progress.entity';
import { NotificationEntity } from '../modules/notifications/entities/notification.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'gym_admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gym_system',
  entities: [
    GymEntity,
    UserEntity,
    MemberEntity,
    MembershipPlanEntity,
    MembershipSubscriptionEntity,
    ClassTypeEntity,
    RoomEntity,
    ClassSessionEntity,
    BookingEntity,
    WaitlistEntryEntity,
    PaymentEntity,
    CheckInEntity,
    ExerciseEntity,
    WorkoutPlanEntity,
    PlanExerciseEntity,
    MemberProgressEntity,
    NotificationEntity
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development'
});

export default dataSource;
