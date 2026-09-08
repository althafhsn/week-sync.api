import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { TaskService } from './task.service.js';
import { FindTasksDto } from './dto/find-tasks.dto.js';
import { AuthenticatedUser } from '../common/report-access.util.js';

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(@Query() filter: FindTasksDto, @Req() req: AuthenticatedRequest) {
    return this.taskService.findAll(filter, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.taskService.findOne(id, req.user);
  }
}
