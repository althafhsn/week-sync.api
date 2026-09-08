import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { RolesGuard } from '../Auth/roles.guard.js';
import { Roles } from '../Auth/roles.decorator.js';
import { TeamMemberService } from './team-member.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { FindTeamMembersDto } from './dto/find-team-members.dto.js';

@Controller('team-members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Manager')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Post()
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamMemberService.create(createTeamMemberDto);
  }

  @Get()
  findAll(@Query() filter: FindTeamMembersDto) {
    return this.teamMemberService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamMemberService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamMemberService.remove(id);
  }
}
