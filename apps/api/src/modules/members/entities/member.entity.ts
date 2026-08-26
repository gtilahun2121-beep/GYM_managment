import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  ForeignKey
} from 'typeorm';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { BookingEntity } from '../../bookings/entities/booking.entity';
import { CheckInEntity } from '../../check-ins/entities/check-in.entity';
import { MembershipSubscriptionEntity } from './membership-subscription.entity';
import { MemberProgressEntity } from '../../workouts/entities/member-progress.entity';
import { WorkoutPlanEntity } from '../../workouts/entities/workout-plan.entity';

@Entity('members')
@Index('idx_members_gym', ['gymId'])
@Index('idx_members_qr', ['qrCodeHash'], { unique: true })
@Index('idx_members_referral', ['referralCode'], { unique: true })
export class MemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => UserEntity)
  userId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergencyContactName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  emergencyContactPhone: string;

  @Column({ type: 'text', nullable: true })
  healthNotes: string;

  @Column({ type: 'jsonb', default: '[]' })
  fitnessGoals: string[];

  @Column({ type: 'varchar', length: 255, unique: true })
  qrCodeHash: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  referralCode: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => MemberEntity)
  referredBy: string;

  @Column({ type: 'date' })
  membershipStartDate: Date;

  @Column({ type: 'date', nullable: true })
  membershipEndDate: Date;

  @Column({ type: 'integer', default: 0 })
  totalCheckIns: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => GymEntity, (gym) => gym.members, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @ManyToOne(() => MemberEntity, { nullable: true })
  referrer: MemberEntity;

  @OneToMany(() => BookingEntity, (booking) => booking.member)
  bookings: BookingEntity[];

  @OneToMany(() => CheckInEntity, (checkIn) => checkIn.member)
  checkIns: CheckInEntity[];

  @OneToMany(() => MembershipSubscriptionEntity, (sub) => sub.member)
  subscriptions: MembershipSubscriptionEntity[];

  @OneToMany(() => MemberProgressEntity, (progress) => progress.member)
  progressLogs: MemberProgressEntity[];

  @OneToMany(() => WorkoutPlanEntity, (plan) => plan.member)
  workoutPlans: WorkoutPlanEntity[];
}
