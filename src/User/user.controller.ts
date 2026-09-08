import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './DTO/create-user.dto.js';
import { UpdateUserDto } from './DTO/update-user.dto.js';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Query('include') include?: string) {
    return this.userService.create(createUserDto, include);
  }

  @Get()
  findAll(@Query('include') include?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.userService.findAll(include, { page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('include') include?: string) {
    return this.userService.findOne(id, include);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: { user: { roleId: number } },
    @Query('include') include?: string,
  ) {
    return this.userService.update(id, updateUserDto, include, req.user.roleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
