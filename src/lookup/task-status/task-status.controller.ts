import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { TaskStatusService } from './task-status.service.js';

@Controller('task-statuses')
@UseGuards(JwtAuthGuard)
export class TaskStatusController {
  constructor(private readonly service: TaskStatusService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
