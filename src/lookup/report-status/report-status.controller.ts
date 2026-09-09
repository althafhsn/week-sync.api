import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { ReportStatusService } from './report-status.service.js';

@Controller('report-statuses')
@UseGuards(JwtAuthGuard)
export class ReportStatusController {
  constructor(private readonly service: ReportStatusService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
