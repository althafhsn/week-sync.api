import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { UserStatusService } from './user-status.service.js';
import { UserStatusController } from './user-status.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [UserStatusController],
  providers: [UserStatusService],
})
export class UserStatusModule {}
