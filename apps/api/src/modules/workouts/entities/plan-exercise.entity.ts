import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  ForeignKey
} from 'typeorm';
import { WorkoutPlanEntity } from './workout-plan.entity';
import { ExerciseEntity } from './exercise.entity';

@Entity('plan_exercises')
@Index('idx_plan_exercises_plan', ['planId'])
export class PlanExerciseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => WorkoutPlanEntity)
  planId: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => ExerciseEntity)
  exerciseId: string;

  @Column({ type: 'integer' })
  dayNumber: number;

  @Column({ type: 'integer' })
  orderIndex: number;

  @Column({ type: 'integer', nullable: true })
  sets: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  reps: string;

  @Column({ type: 'integer', default: 60 })
  restSeconds: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => WorkoutPlanEntity, (plan) => plan.exercises, {
    onDelete: 'CASCADE'
  })
  plan: WorkoutPlanEntity;

  @ManyToOne(() => ExerciseEntity, (exercise) => exercise.planExercises)
  exercise: ExerciseEntity;
}
