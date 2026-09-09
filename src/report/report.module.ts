import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { VectorStoreModule } from '../vector-store/vector-store.module.js';
import { ReportService } from './report.service.js';
import { ReportController } from './report.controller.js';
import { ReportSearchFilterService } from './report-search-filter.service.js';

@Module({
  imports: [AuthModule, VectorStoreModule],
  controllers: [ReportController],
  providers: [ReportService, ReportSearchFilterService],
  exports: [ReportService],
})
export class ReportModule {}
