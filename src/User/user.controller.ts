import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './DTO/create-user.dto.js';
import { UpdateUserDto } from './DTO/update-user.dto.js';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';
import { RolesGuard } from '../Auth/roles.guard.js';
import { Roles } from '../Auth/roles.decorator.js';

interface AuthenticatedRequest {
  user: { sub: string; roleId: number };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Manager')
  create(@Body() createUserDto: CreateUserDto, @Query('include') include?: string) {
    return this.userService.create(createUserDto, include);
  }

  @Get()
  findAll(@Query('include') include?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.userService.findAll(include, { page, pageSize });
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Query('include') include?: string,
  ) {
    return this.userService.findOne(id, include, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
    @Query('include') include?: string,
  ) {
    return this.userService.update(id, updateUserDto, include, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('Manager')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
