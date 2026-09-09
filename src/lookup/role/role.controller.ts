import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { RoleService } from './role.service.js';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
