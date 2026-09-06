import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { TaskService } from './task.service.js';
import { TaskController } from './task.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
