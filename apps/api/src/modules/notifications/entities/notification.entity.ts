import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  ForeignKey
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { NotificationType, NotificationStatus } from '@gym/shared-types';

@Entity('notifications')
@Index('idx_notif_recipient', ['recipientId'])
@Index('idx_notif_status', ['status'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => UserEntity)
  recipientId: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: [
      NotificationType.EMAIL,
      NotificationType.SMS,
      NotificationType.PUSH,
      NotificationType.IN_APP
    ]
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 100 })
  templateKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: NotificationStatus.PENDING,
    enum: [
      NotificationStatus.PENDING,
      NotificationStatus.SENT,
      NotificationStatus.FAILED,
      NotificationStatus.BOUNCED
    ]
  })
  status: NotificationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  openedAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  recipient: UserEntity;

  @ManyToOne(() => GymEntity, (gym) => gym.notifications, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  gym: GymEntity;
}
