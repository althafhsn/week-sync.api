import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { ReportHoursService } from './report-hours.service.js';

@Module({
  imports: [AuthModule],
  providers: [ReportHoursService],
})
export class ReportHoursModule {}
