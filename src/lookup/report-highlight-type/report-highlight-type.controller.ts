import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { ReportHighlightTypeService } from './report-highlight-type.service.js';
import { CreateReportHighlightTypeDto } from './dto/create-report-highlight-type.dto.js';
import { UpdateReportHighlightTypeDto } from './dto/update-report-highlight-type.dto.js';

@Controller('report-highlight-types')
@UseGuards(JwtAuthGuard)
export class ReportHighlightTypeController {
  constructor(private readonly service: ReportHighlightTypeService) {}

  @Post()
  create(@Body() dto: CreateReportHighlightTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReportHighlightTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
