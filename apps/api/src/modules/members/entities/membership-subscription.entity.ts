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
import { MemberEntity } from './member.entity';
import { MembershipPlanEntity } from './membership-plan.entity';
import { PaymentEntity } from '../../payments/entities/payment.entity';
import { SubscriptionStatus } from '@gym/shared-types';

@Entity('membership_subscriptions')
@Index('idx_subs_member', ['memberId'])
@Index('idx_subs_status', ['status'])
@Index('idx_subs_stripe', ['stripeSubscriptionId'])
export class MembershipSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => MemberEntity)
  memberId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => MembershipPlanEntity)
  planId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: SubscriptionStatus.ACTIVE,
    enum: [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.EXPIRED,
      SubscriptionStatus.FROZEN,
      SubscriptionStatus.PENDING_PAYMENT
    ]
  })
  status: SubscriptionStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId: string;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cancellationReason: string;

  @Column({ type: 'date', nullable: true })
  frozenUntil: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => MemberEntity, (member) => member.subscriptions, {
    onDelete: 'CASCADE'
  })
  member: MemberEntity;

  @ManyToOne(() => MembershipPlanEntity, (plan) => plan.subscriptions)
  plan: MembershipPlanEntity;

  @OneToMany(() => PaymentEntity, (payment) => payment.subscription)
  payments: PaymentEntity[];
}
