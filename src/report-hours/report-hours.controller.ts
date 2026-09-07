import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportHoursService } from './report-hours.service.js';
import { FindReportHoursDto } from './dto/find-report-hours.dto.js';

@Controller('report-hours')
@UseGuards(JwtAuthGuard)
export class ReportHoursController {
  constructor(private readonly reportHoursService: ReportHoursService) {}

  @Get()
  findAll(@Query() filter: FindReportHoursDto) {
    return this.reportHoursService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportHoursService.findOne(id);
  }
}
