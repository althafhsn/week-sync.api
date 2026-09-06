import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportVersionService } from './report-version.service.js';
import { CreateReportVersionDto } from './dto/create-report-version.dto.js';
import { UpdateReportVersionDto } from './dto/update-report-version.dto.js';
import { FindReportVersionsDto } from './dto/find-report-versions.dto.js';

@Controller('report-versions')
@UseGuards(JwtAuthGuard)
export class ReportVersionController {
  constructor(private readonly reportVersionService: ReportVersionService) {}

  @Post()
  create(@Body() createReportVersionDto: CreateReportVersionDto) {
    return this.reportVersionService.create(createReportVersionDto);
  }

  @Get()
  findAll(@Query() filter: FindReportVersionsDto) {
    return this.reportVersionService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportVersionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReportVersionDto: UpdateReportVersionDto) {
    return this.reportVersionService.update(id, updateReportVersionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportVersionService.remove(id);
  }
}
