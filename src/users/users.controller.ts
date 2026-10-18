import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAll() { return this.usersService.getAll(); }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) { return this.usersService.findById(id); }

  @Post()
  create(@Body() body: any) { return this.usersService.createUser(body); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.usersService.deleteUser(id); }
}