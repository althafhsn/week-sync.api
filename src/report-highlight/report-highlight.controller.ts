import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportHighlightService } from './report-highlight.service.js';
import { FindReportHighlightsDto } from './dto/find-report-highlights.dto.js';
import { AuthenticatedUser } from '../common/report-access.util.js';

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

@Controller('report-highlights')
@UseGuards(JwtAuthGuard)
export class ReportHighlightController {
  constructor(private readonly reportHighlightService: ReportHighlightService) {}

  @Get()
  findAll(@Query() filter: FindReportHighlightsDto, @Req() req: AuthenticatedRequest) {
    return this.reportHighlightService.findAll(filter, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.reportHighlightService.findOne(id, req.user);
  }
}
