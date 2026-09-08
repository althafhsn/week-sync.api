import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportHoursService } from './report-hours.service.js';
import { FindReportHoursDto } from './dto/find-report-hours.dto.js';
import { AuthenticatedUser } from '../common/report-access.util.js';

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

@Controller('report-hours')
@UseGuards(JwtAuthGuard)
export class ReportHoursController {
  constructor(private readonly reportHoursService: ReportHoursService) {}

  @Get()
  findAll(@Query() filter: FindReportHoursDto, @Req() req: AuthenticatedRequest) {
    return this.reportHoursService.findAll(filter, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.reportHoursService.findOne(id, req.user);
  }
}
