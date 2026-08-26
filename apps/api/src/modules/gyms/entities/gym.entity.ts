import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { MemberEntity } from '../../members/entities/member.entity';
import { ClassTypeEntity } from '../../classes/entities/class-type.entity';
import { RoomEntity } from '../../classes/entities/room.entity';
import { PaymentEntity } from '../../payments/entities/payment.entity';
import { NotificationEntity } from '../../notifications/entities/notification.entity';

@Entity('gyms')
@Index('idx_gyms_slug', ['slug'], { unique: true })
@Index('idx_gyms_active', ['isActive'])
export class GymEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, default: 'US' })
  country: string;

  @Column({ type: 'varchar', length: 50, default: 'America/New_York' })
  timezone: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => UserEntity, (user) => user.gym)
  users: UserEntity[];

  @OneToMany(() => MemberEntity, (member) => member.gym)
  members: MemberEntity[];

  @OneToMany(() => ClassTypeEntity, (classType) => classType.gym)
  classTypes: ClassTypeEntity[];

  @OneToMany(() => RoomEntity, (room) => room.gym)
  rooms: RoomEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.gym)
  payments: PaymentEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.gym)
  notifications: NotificationEntity[];
}
