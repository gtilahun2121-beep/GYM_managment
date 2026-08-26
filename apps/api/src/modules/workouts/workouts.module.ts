import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseEntity } from './entities/exercise.entity';
import { WorkoutPlanEntity } from './entities/workout-plan.entity';
import { PlanExerciseEntity } from './entities/plan-exercise.entity';
import { MemberProgressEntity } from './entities/member-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExerciseEntity,
      WorkoutPlanEntity,
      PlanExerciseEntity,
      MemberProgressEntity
    ])
  ]
})
export class WorkoutsModule {}
