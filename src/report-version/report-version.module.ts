import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { ReportVersionService } from './report-version.service.js';
import { ReportVersionController } from './report-version.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportVersionController],
  providers: [ReportVersionService],
  exports: [ReportVersionService],
})
export class ReportVersionModule {}
