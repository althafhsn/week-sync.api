import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { PriorityTypeService } from './priority-type.service.js';

@Controller('priority-types')
@UseGuards(JwtAuthGuard)
export class PriorityTypeController {
  constructor(private readonly service: PriorityTypeService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }
}
