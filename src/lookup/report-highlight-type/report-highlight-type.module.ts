import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { ReportHighlightTypeService } from './report-highlight-type.service.js';
import { ReportHighlightTypeController } from './report-highlight-type.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportHighlightTypeController],
  providers: [ReportHighlightTypeService],
})
export class ReportHighlightTypeModule {}
