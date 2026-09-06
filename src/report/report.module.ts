import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { ReportService } from './report.service.js';
import { ReportController } from './report.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
