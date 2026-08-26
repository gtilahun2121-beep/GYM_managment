import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  ForeignKey
} from 'typeorm';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { ClassTypeEntity } from './class-type.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { RoomEntity } from './room.entity';
import { BookingEntity } from '../../bookings/entities/booking.entity';
import { ClassSessionStatus } from '@gym/shared-types';

@Entity('class_sessions')
@Index('idx_sessions_time', ['startTime', 'endTime'])
@Index('idx_sessions_gym_time', ['gymId', 'startTime'])
@Index('idx_sessions_trainer', ['trainerId', 'startTime'])
@Index('idx_sessions_status', ['status'])
export class ClassSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => ClassTypeEntity)
  classTypeId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => UserEntity)
  trainerId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => RoomEntity)
  roomId: string;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'integer' })
  maxCapacity: number;

  @Column({ type: 'integer', default: 0 })
  currentBookings: number;

  @Column({ type: 'integer', default: 0 })
  waitlistCount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: ClassSessionStatus.SCHEDULED,
    enum: [
      ClassSessionStatus.SCHEDULED,
      ClassSessionStatus.CANCELLED,
      ClassSessionStatus.COMPLETED,
      ClassSessionStatus.IN_PROGRESS
    ]
  })
  status: ClassSessionStatus;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recurrenceRule: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => ClassSessionEntity)
  parentSessionId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => GymEntity, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @ManyToOne(() => ClassTypeEntity, (classType) => classType.sessions)
  classType: ClassTypeEntity;

  @ManyToOne(() => UserEntity, (trainer) => trainer.classSessions)
  trainer: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.classSessions)
  room: RoomEntity;

  @ManyToOne(() => ClassSessionEntity, { nullable: true })
  parentSession: ClassSessionEntity;

  @OneToMany(() => BookingEntity, (booking) => booking.session)
  bookings: BookingEntity[];
}
