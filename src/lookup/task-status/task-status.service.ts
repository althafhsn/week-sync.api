import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';
import { CreateLookupDto } from '../../common/lookup/dto/create-lookup.dto.js';
import { UpdateLookupDto } from '../../common/lookup/dto/update-lookup.dto.js';

@Injectable()
export class TaskStatusService extends LookupService<TaskStatus, CreateLookupDto, UpdateLookupDto> {
  constructor(prisma: PrismaService) {
    super(prisma.taskStatus, 'Task status');
  }
}
