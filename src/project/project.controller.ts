import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { getUuidFilterParam, getIntFilterParam } from '../common/query-filter.util.js';

@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Query('include') include?: string) {
    return this.projectService.create(createProjectDto, include);
  }

  @Get()
  findAll(@Query('include') include?: string, @Query() query?: Record<string, unknown>) {
    const userId = getUuidFilterParam(query, 'filters.userId');
    const projectStatusId = getIntFilterParam(query, 'filters.projectStatusId');
    return this.projectService.findAll(include, { userId, projectStatusId }, {
      page: query?.page as string | undefined,
      pageSize: query?.pageSize as string | undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('include') include?: string) {
    return this.projectService.findOne(id, include);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Query('include') include?: string,
  ) {
    return this.projectService.update(id, updateProjectDto, include);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.remove(id);
  }
}
