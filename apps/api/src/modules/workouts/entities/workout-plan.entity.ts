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
import { UserEntity } from '../../users/entities/user.entity';
import { MemberEntity } from '../../members/entities/member.entity';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { PlanExerciseEntity } from './plan-exercise.entity';
import { WorkoutDifficulty } from '@gym/shared-types';

@Entity('workout_plans')
@Index('idx_plans_trainer', ['trainerId'])
@Index('idx_plans_member', ['memberId'])
@Index('idx_plans_gym', ['gymId'])
export class WorkoutPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => UserEntity)
  trainerId: string;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => MemberEntity)
  memberId: string;

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
    enum: [WorkoutDifficulty.BEGINNER, WorkoutDifficulty.INTERMEDIATE, WorkoutDifficulty.ADVANCED]
  })
  difficulty: WorkoutDifficulty;

  @Column({ type: 'integer', nullable: true })
  durationWeeks: number;

  @Column({ type: 'integer', nullable: true })
  sessionsPerWeek: number;

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => UserEntity, { nullable: true })
  trainer: UserEntity;

  @ManyToOne(() => MemberEntity, (member) => member.workoutPlans, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  member: MemberEntity;

  @ManyToOne(() => GymEntity, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @OneToMany(() => PlanExerciseEntity, (planEx) => planEx.plan)
  exercises: PlanExerciseEntity[];
}
