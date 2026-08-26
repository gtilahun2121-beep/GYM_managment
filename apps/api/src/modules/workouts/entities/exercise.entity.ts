import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { PlanExerciseEntity } from './plan-exercise.entity';
import { WorkoutDifficulty } from '@gym/shared-types';

@Entity('exercises')
@Index('idx_exercises_muscle', ['muscleGroup'])
@Index('idx_exercises_equipment', ['equipment'])
export class ExerciseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  muscleGroup: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  equipment: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: [WorkoutDifficulty.BEGINNER, WorkoutDifficulty.INTERMEDIATE, WorkoutDifficulty.ADVANCED]
  })
  difficulty: WorkoutDifficulty;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl: string;

  @Column({ type: 'jsonb', default: '[]' })
  imageUrls: string[];

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  tips: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @OneToMany(() => PlanExerciseEntity, (planEx) => planEx.exercise)
  planExercises: PlanExerciseEntity[];
}
