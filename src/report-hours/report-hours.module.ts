import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { ReportHoursService } from './report-hours.service.js';
import { ReportHoursController } from './report-hours.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportHoursController],
  providers: [ReportHoursService],
})
export class ReportHoursModule {}
