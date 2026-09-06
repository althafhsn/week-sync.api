import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { ReportStatusService } from './report-status.service.js';
import { ReportStatusController } from './report-status.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportStatusController],
  providers: [ReportStatusService],
})
export class ReportStatusModule {}
