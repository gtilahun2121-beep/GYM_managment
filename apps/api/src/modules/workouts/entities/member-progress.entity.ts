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

@Entity('member_progress')
@Index('idx_progress_member', ['memberId'])
export class MemberProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => MemberEntity)
  memberId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  recordedAt: Date;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  weightKg: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  bodyFatPct: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  muscleMassKg: number;

  @Column({ type: 'numeric', precision: 4, scale: 1, nullable: true })
  bmi: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, nullable: true })
  chestCm: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, nullable: true })
  waistCm: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, nullable: true })
  hipsCm: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, nullable: true })
  armsCm: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, nullable: true })
  thighsCm: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoFrontUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoSideUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoBackUrl: string;

  // Relations
  @ManyToOne(() => MemberEntity, (member) => member.progressLogs, {
    onDelete: 'CASCADE'
  })
  member: MemberEntity;
}
