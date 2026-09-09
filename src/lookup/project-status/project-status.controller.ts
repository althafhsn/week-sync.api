import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { ProjectStatusService } from './project-status.service.js';

@Controller('project-statuses')
@UseGuards(JwtAuthGuard)
export class ProjectStatusController {
  constructor(private readonly service: ProjectStatusService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
