import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PlanExercisesService } from './plan-exercises.service';
import { PlanExercisesController } from './plan-exercises.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [PlanExercisesController],
  providers: [PlanExercisesService],
  exports: [PlanExercisesService],
})
export class PlanExercisesModule {}