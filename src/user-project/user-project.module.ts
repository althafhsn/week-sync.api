import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { UserProjectService } from './user-project.service.js';
import { UserProjectController } from './user-project.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [UserProjectController],
  providers: [UserProjectService],
})
export class UserProjectModule {}
