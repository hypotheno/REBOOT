import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PlanExercisesService } from './plan-exercises.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plan-exercises')
@UseGuards(JwtAuthGuard)
export class PlanExercisesController {
  constructor(private service: PlanExercisesService) {}

  @Get()
  getAll() { return this.service.getAll(); }

  // must be declared BEFORE ':planId/:exerciseId'
  @Get('plan/:planId')
  getByPlan(@Param('planId', ParseIntPipe) planId: number) { return this.service.findByPlan(planId); }

  @Get(':planId/:exerciseId')
  getOne(@Param('planId', ParseIntPipe) planId: number, @Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.service.findOne(planId, exerciseId);
  }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':planId/:exerciseId')
  update(
    @Param('planId', ParseIntPipe) planId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() body: any,
  ) {
    return this.service.update(planId, exerciseId, body);
  }

  @Delete(':planId/:exerciseId')
  remove(@Param('planId', ParseIntPipe) planId: number, @Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.service.remove(planId, exerciseId);
  }
}