import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { TeamMemberService } from './team-member.service.js';
import { TeamMemberController } from './team-member.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [TeamMemberController],
  providers: [TeamMemberService],
})
export class TeamMemberModule {}
