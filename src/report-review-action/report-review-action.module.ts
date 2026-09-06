import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { ReportReviewActionService } from './report-review-action.service.js';
import { ReportReviewActionController } from './report-review-action.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportReviewActionController],
  providers: [ReportReviewActionService],
})
export class ReportReviewActionModule {}
