import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}