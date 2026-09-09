import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { TaskService } from './task.service.js';

@Module({
  imports: [AuthModule],
  providers: [TaskService],
})
export class TaskModule {}
