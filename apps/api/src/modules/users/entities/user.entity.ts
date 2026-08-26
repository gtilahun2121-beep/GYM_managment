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
import { ClassSessionEntity } from '../../classes/entities/class-session.entity';
import { NotificationEntity } from '../../notifications/entities/notification.entity';
import { UserRole, UserStatus } from '@gym/shared-types';

@Entity('users')
@Index('idx_users_gym_email', ['gymId', 'email'], { unique: true })
@Index('idx_users_role', ['gymId', 'role'])
@Index('idx_users_status', ['gymId', 'status'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: [
      UserRole.SUPER_ADMIN,
      UserRole.GYM_MANAGER,
      UserRole.RECEPTIONIST,
      UserRole.TRAINER,
      UserRole.MEMBER
    ]
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mfaSecret: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserStatus.ACTIVE,
    enum: [
      UserStatus.ACTIVE,
      UserStatus.INACTIVE,
      UserStatus.SUSPENDED,
      UserStatus.DELETED
    ]
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => GymEntity, (gym) => gym.users, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @OneToMany(() => ClassSessionEntity, (session) => session.trainer)
  classSessions: ClassSessionEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.recipient)
  notifications: NotificationEntity[];
}
