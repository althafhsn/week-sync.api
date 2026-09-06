import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { UserProjectService } from './user-project.service.js';
import { CreateUserProjectDto } from './dto/create-user-project.dto.js';
import { FindUserProjectsDto } from './dto/find-user-projects.dto.js';

@Controller('user-projects')
@UseGuards(JwtAuthGuard)
export class UserProjectController {
  constructor(private readonly userProjectService: UserProjectService) {}

  @Post()
  create(@Body() createUserProjectDto: CreateUserProjectDto) {
    return this.userProjectService.create(createUserProjectDto);
  }

  @Get()
  findAll(@Query() filter: FindUserProjectsDto) {
    return this.userProjectService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userProjectService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userProjectService.remove(id);
  }
}
