import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { ReportHighlightService } from './report-highlight.service.js';

@Module({
  imports: [AuthModule],
  providers: [ReportHighlightService],
})
export class ReportHighlightModule {}
