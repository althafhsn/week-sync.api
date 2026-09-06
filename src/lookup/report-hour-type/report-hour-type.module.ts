import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { ReportHourTypeService } from './report-hour-type.service.js';
import { ReportHourTypeController } from './report-hour-type.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReportHourTypeController],
  providers: [ReportHourTypeService],
})
export class ReportHourTypeModule {}
