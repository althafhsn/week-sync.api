import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportHighlightService } from './report-highlight.service.js';
import { FindReportHighlightsDto } from './dto/find-report-highlights.dto.js';

@Controller('report-highlights')
@UseGuards(JwtAuthGuard)
export class ReportHighlightController {
  constructor(private readonly reportHighlightService: ReportHighlightService) {}

  @Get()
  findAll(@Query() filter: FindReportHighlightsDto) {
    return this.reportHighlightService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportHighlightService.findOne(id);
  }
}
