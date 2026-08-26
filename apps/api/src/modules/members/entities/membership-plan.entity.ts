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
import { MembershipSubscriptionEntity } from './membership-subscription.entity';
import { BillingFrequency } from '@gym/shared-types';

@Entity('membership_plans')
@Index('idx_plans_gym_active', ['gymId', 'isActive'])
export class MembershipPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: [
      BillingFrequency.MONTHLY,
      BillingFrequency.QUARTERLY,
      BillingFrequency.ANNUAL,
      BillingFrequency.ONE_TIME
    ]
  })
  billingFrequency: BillingFrequency;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb', default: '{}' })
  features: Record<string, any>;

  @Column({ type: 'integer', default: 7 })
  maxBookingsPerWeek: number;

  @Column({ type: 'text', nullable: true })
  cancellationPolicy: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => GymEntity, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @OneToMany(() => MembershipSubscriptionEntity, (sub) => sub.plan)
  subscriptions: MembershipSubscriptionEntity[];
}
