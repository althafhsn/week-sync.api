import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class TaskStatusService extends LookupService<TaskStatus> {
  constructor(prisma: PrismaService) {
    super(prisma.taskStatus);
  }
}
