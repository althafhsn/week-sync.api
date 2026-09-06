import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { ReportHighlightService } from './report-highlight.service.js';
import { ReportHighlightController } from './report-highlight.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportHighlightController],
  providers: [ReportHighlightService],
})
export class ReportHighlightModule {}
