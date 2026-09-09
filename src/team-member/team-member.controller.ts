import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { RolesGuard } from '../Auth/roles.guard.js';
import { Roles } from '../Auth/roles.decorator.js';
import { TeamMemberService } from './team-member.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';

@Controller('team-members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Manager')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Post()
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamMemberService.create(createTeamMemberDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamMemberService.remove(id);
  }
}
