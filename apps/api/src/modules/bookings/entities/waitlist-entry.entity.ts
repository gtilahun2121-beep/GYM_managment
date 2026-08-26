import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  ForeignKey,
  Unique
} from 'typeorm';
import { ClassSessionEntity } from '../../classes/entities/class-session.entity';
import { MemberEntity } from '../../members/entities/member.entity';

@Entity('waitlist_entries')
@Index('idx_waitlist_session', ['sessionId', 'position'])
@Unique(['sessionId', 'memberId'])
export class WaitlistEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => ClassSessionEntity)
  sessionId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => MemberEntity)
  memberId: string;

  @Column({ type: 'integer' })
  position: number;

  @Column({ type: 'timestamptz', nullable: true })
  notifiedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  promotedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ClassSessionEntity, { onDelete: 'CASCADE' })
  session: ClassSessionEntity;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  member: MemberEntity;
}
