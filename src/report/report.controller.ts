import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportService } from './report.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { getUuidFilterParam, getIntFilterParam, getDateFilterParam } from '../common/query-filter.util.js';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto, @Query('include') include?: string) {
    return this.reportService.create(createReportDto, include);
  }

  @Get()
  findAll(@Query('include') include?: string, @Query() query?: Record<string, unknown>) {
    const userId = getUuidFilterParam(query, 'filters.userId');
    const projectId = getUuidFilterParam(query, 'filters.projectId');
    const reportStatusId = getIntFilterParam(query, 'filters.reportStatusId');
    const startDate = getDateFilterParam(query, 'filters.startDate');
    const endDate = getDateFilterParam(query, 'filters.endDate');

    return this.reportService.findAll(
      include,
      { userId, projectId, reportStatusId, startDate, endDate },
      { page: query?.page as string | undefined, pageSize: query?.pageSize as string | undefined },
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('include') include?: string) {
    return this.reportService.findOne(id, include);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Query('include') include?: string,
  ) {
    return this.reportService.update(id, updateReportDto, include);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.remove(id);
  }
}
