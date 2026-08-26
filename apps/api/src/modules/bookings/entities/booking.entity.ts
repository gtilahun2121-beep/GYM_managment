import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  ForeignKey,
  Unique
} from 'typeorm';
import { ClassSessionEntity } from '../../classes/entities/class-session.entity';
import { MemberEntity } from '../../members/entities/member.entity';
import { CheckInEntity } from '../../check-ins/entities/check-in.entity';
import { BookingStatus } from '@gym/shared-types';

@Entity('bookings')
@Index('idx_bookings_member', ['memberId', 'status'])
@Index('idx_bookings_session', ['sessionId', 'status'])
@Index('idx_bookings_waitlist', ['sessionId', 'waitlistPosition'], {
  where: 'status = \'waitlist\''
})
@Unique(['sessionId', 'memberId'])
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => ClassSessionEntity)
  sessionId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => MemberEntity)
  memberId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: BookingStatus.CONFIRMED,
    enum: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.NO_SHOW,
      BookingStatus.ATTENDED,
      BookingStatus.WAITLIST
    ]
  })
  status: BookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  bookedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  checkedInAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cancellationReason: string;

  @Column({ type: 'integer', nullable: true })
  waitlistPosition: number;

  @Column({ type: 'boolean', default: false })
  isWaitlistPromoted: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ClassSessionEntity, (session) => session.bookings, {
    onDelete: 'CASCADE'
  })
  session: ClassSessionEntity;

  @ManyToOne(() => MemberEntity, (member) => member.bookings, {
    onDelete: 'CASCADE'
  })
  member: MemberEntity;

  @OneToMany(() => CheckInEntity, (checkIn) => checkIn.booking)
  checkIns: CheckInEntity[];
}
