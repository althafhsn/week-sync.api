import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { TaskStatusService } from './task-status.service.js';
import { TaskStatusController } from './task-status.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [TaskStatusController],
  providers: [TaskStatusService],
})
export class TaskStatusModule {}
