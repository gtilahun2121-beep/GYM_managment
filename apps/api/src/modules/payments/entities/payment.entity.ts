import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  ForeignKey
} from 'typeorm';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { MemberEntity } from '../../members/entities/member.entity';
import { MembershipSubscriptionEntity } from '../../members/entities/membership-subscription.entity';
import { PaymentStatus, PaymentType } from '@gym/shared-types';

@Entity('payments')
@Index('idx_payments_member', ['memberId'])
@Index('idx_payments_gym', ['gymId'])
@Index('idx_payments_stripe', ['stripePaymentIntentId'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => MemberEntity)
  memberId: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => MembershipSubscriptionEntity)
  subscriptionId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.PENDING,
    enum: [
      PaymentStatus.PENDING,
      PaymentStatus.SUCCEEDED,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
      PaymentStatus.DISPUTED
    ]
  })
  status: PaymentStatus;

  @Column({
    type: 'varchar',
    length: 30,
    enum: [
      PaymentType.SUBSCRIPTION,
      PaymentType.ONE_TIME,
      PaymentType.REFUND,
      PaymentType.COMMISSION,
      PaymentType.MERCHANDISE
    ]
  })
  type: PaymentType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeChargeId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => GymEntity, (gym) => gym.payments)
  gym: GymEntity;

  @ManyToOne(() => MemberEntity, (member) => member.subscriptions, {
    nullable: true
  })
  member: MemberEntity;

  @ManyToOne(() => MembershipSubscriptionEntity, (sub) => sub.payments, {
    nullable: true
  })
  subscription: MembershipSubscriptionEntity;
}
