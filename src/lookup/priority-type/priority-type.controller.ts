import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/jwt-auth.guard.js';
import { PriorityTypeService } from './priority-type.service.js';
import { CreateLookupDto } from '../../common/lookup/dto/create-lookup.dto.js';
import { UpdateLookupDto } from '../../common/lookup/dto/update-lookup.dto.js';

@Controller('priority-types')
@UseGuards(JwtAuthGuard)
export class PriorityTypeController {
  constructor(private readonly service: PriorityTypeService) {}

  @Post()
  create(@Body() dto: CreateLookupDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.findAll({ page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLookupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
