import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { TeamService } from './team.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { RolesGuard } from '../Auth/roles.guard.js';
import { Roles } from '../Auth/roles.decorator.js';
import { getUuidFilterParam } from '../common/query-filter.util.js';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Manager')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Query('include') include?: string) {
    return this.teamService.create(createTeamDto, include);
  }

  @Get()
  findAll(@Query('include') include?: string, @Query() query?: Record<string, unknown>) {
    const userId = getUuidFilterParam(query, 'filters.userId');
    return this.teamService.findAll(include, { userId }, {
      page: query?.page as string | undefined,
      pageSize: query?.pageSize as string | undefined,
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Query('include') include?: string,
  ) {
    return this.teamService.update(id, updateTeamDto, include);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamService.remove(id);
  }
}
