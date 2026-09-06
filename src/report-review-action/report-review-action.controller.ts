import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { ReportReviewActionService } from './report-review-action.service.js';
import { CreateReportReviewActionDto } from './dto/create-report-review-action.dto.js';
import { UpdateReportReviewActionDto } from './dto/update-report-review-action.dto.js';
import { FindReportReviewActionsDto } from './dto/find-report-review-actions.dto.js';

@Controller('report-review-actions')
@UseGuards(JwtAuthGuard)
export class ReportReviewActionController {
  constructor(private readonly reportReviewActionService: ReportReviewActionService) {}

  @Post()
  create(@Body() createReportReviewActionDto: CreateReportReviewActionDto) {
    return this.reportReviewActionService.create(createReportReviewActionDto);
  }

  @Get()
  findAll(@Query() filter: FindReportReviewActionsDto) {
    return this.reportReviewActionService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportReviewActionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReportReviewActionDto: UpdateReportReviewActionDto) {
    return this.reportReviewActionService.update(id, updateReportReviewActionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportReviewActionService.remove(id);
  }
}
