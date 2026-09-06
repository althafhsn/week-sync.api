import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportHoursService } from './report-hours.service.js';
import { CreateReportHoursDto } from './dto/create-report-hours.dto.js';
import { UpdateReportHoursDto } from './dto/update-report-hours.dto.js';
import { FindReportHoursDto } from './dto/find-report-hours.dto.js';

@Controller('report-hours')
@UseGuards(JwtAuthGuard)
export class ReportHoursController {
  constructor(private readonly reportHoursService: ReportHoursService) {}

  @Post()
  create(@Body() createReportHoursDto: CreateReportHoursDto) {
    return this.reportHoursService.create(createReportHoursDto);
  }

  @Get()
  findAll(@Query() filter: FindReportHoursDto) {
    return this.reportHoursService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportHoursService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReportHoursDto: UpdateReportHoursDto) {
    return this.reportHoursService.update(id, updateReportHoursDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportHoursService.remove(id);
  }
}
