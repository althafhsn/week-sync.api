import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { ProjectStatusService } from './project-status.service.js';
import { ProjectStatusController } from './project-status.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ProjectStatusController],
  providers: [ProjectStatusService],
})
export class ProjectStatusModule {}
