import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportService } from './report.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { FindReportsDto } from './dto/find-reports.dto.js';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  @Get()
  findAll(@Query() filter: FindReportsDto) {
    return this.reportService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(id, updateReportDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.remove(id);
  }
}
