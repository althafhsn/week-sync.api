import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { ReportHourTypeService } from './report-hour-type.service.js';

@Controller('report-hour-types')
@UseGuards(JwtAuthGuard)
export class ReportHourTypeController {
  constructor(private readonly service: ReportHourTypeService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
