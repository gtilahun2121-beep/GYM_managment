import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  ForeignKey
} from 'typeorm';
import { MemberEntity } from '../../members/entities/member.entity';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { BookingEntity } from '../../bookings/entities/booking.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CheckInMethod } from '@gym/shared-types';

@Entity('check_ins')
@Index('idx_checkins_member', ['memberId'])
@Index('idx_checkins_gym_time', ['gymId'])
@Index('idx_checkins_date', ['checkInTime'])
export class CheckInEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => MemberEntity)
  memberId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: [CheckInMethod.QR_CODE, CheckInMethod.MANUAL, CheckInMethod.APP, CheckInMethod.CARD]
  })
  method: CheckInMethod;

  @CreateDateColumn({ type: 'timestamptz' })
  checkInTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  checkOutTime: Date;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => BookingEntity)
  bookingId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceInfo: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => UserEntity)
  staffId: string;

  // Relations
  @ManyToOne(() => MemberEntity, (member) => member.checkIns, {
    onDelete: 'CASCADE'
  })
  member: MemberEntity;

  @ManyToOne(() => GymEntity, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @ManyToOne(() => BookingEntity, { onDelete: 'SET NULL', nullable: true })
  booking: BookingEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  staff: UserEntity;
}
