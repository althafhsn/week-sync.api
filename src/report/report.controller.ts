import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportService } from './report.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { getUuidFilterParam, getIntFilterParam, getDateFilterParam } from '../common/query-filter.util.js';
import { AuthenticatedUser } from '../common/report-access.util.js';

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(
    @Body() createReportDto: CreateReportDto,
    @Req() req: AuthenticatedRequest,
    @Query('include') include?: string,
  ) {
    return this.reportService.create(createReportDto, req.user, include);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('include') include?: string,
    @Query() query?: Record<string, unknown>,
  ) {
    const userId = getUuidFilterParam(query, 'filters.userId');
    const projectId = getUuidFilterParam(query, 'filters.projectId');
    const reportStatusId = getIntFilterParam(query, 'filters.reportStatusId');
    const startDate = getDateFilterParam(query, 'filters.startDate');
    const endDate = getDateFilterParam(query, 'filters.endDate');

    return this.reportService.findAll(
      include,
      { userId, projectId, reportStatusId, startDate, endDate },
      req.user,
      { page: query?.page as string | undefined, pageSize: query?.pageSize as string | undefined },
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Query('include') include?: string,
  ) {
    return this.reportService.findOne(id, req.user, include);
  }

  @Get(':id/history')
  getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Query() query?: Record<string, unknown>,
  ) {
    return this.reportService.getHistory(id, req.user, {
      page: query?.page as string | undefined,
      pageSize: query?.pageSize as string | undefined,
    });
  }

  @Get(':id/history/:historyId')
  getHistoryVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('historyId', ParseUUIDPipe) historyId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reportService.getHistoryVersion(id, historyId, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: AuthenticatedRequest,
    @Query('include') include?: string,
  ) {
    return this.reportService.update(id, updateReportDto, req.user, include);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.reportService.remove(id, req.user);
  }
}
