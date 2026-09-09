import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { UserStatusService } from './user-status.service.js';

@Controller('user-statuses')
@UseGuards(JwtAuthGuard)
export class UserStatusController {
  constructor(private readonly service: UserStatusService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
