import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportHighlightService } from './report-highlight.service.js';
import { CreateReportHighlightDto } from './dto/create-report-highlight.dto.js';
import { UpdateReportHighlightDto } from './dto/update-report-highlight.dto.js';
import { FindReportHighlightsDto } from './dto/find-report-highlights.dto.js';

@Controller('report-highlights')
@UseGuards(JwtAuthGuard)
export class ReportHighlightController {
  constructor(private readonly reportHighlightService: ReportHighlightService) {}

  @Post()
  create(@Body() createReportHighlightDto: CreateReportHighlightDto) {
    return this.reportHighlightService.create(createReportHighlightDto);
  }

  @Get()
  findAll(@Query() filter: FindReportHighlightsDto) {
    return this.reportHighlightService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportHighlightService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReportHighlightDto: UpdateReportHighlightDto) {
    return this.reportHighlightService.update(id, updateReportHighlightDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportHighlightService.remove(id);
  }
}
