import { Module } from '@nestjs/common';
import { ProjectService } from './project.service.js';
import { ProjectController } from './project.controller.js';
import { AuthModule } from '../Auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
