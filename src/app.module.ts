import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GoalsModule } from './goals/goals.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { PlanExercisesModule } from './plan-exercises/plan-exercises.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    GoalsModule,
    ExercisesModule,
    WorkoutPlansModule,
    PlanExercisesModule,
    ActivityLogsModule,
  ],
})
export class AppModule {}