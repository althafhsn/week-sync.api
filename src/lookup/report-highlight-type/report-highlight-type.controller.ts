import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { ReportHighlightTypeService } from './report-highlight-type.service.js';

@Controller('report-highlight-types')
@UseGuards(JwtAuthGuard)
export class ReportHighlightTypeController {
  constructor(private readonly service: ReportHighlightTypeService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
