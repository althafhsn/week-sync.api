import { Injectable } from '@nestjs/common';
import { PriorityType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class PriorityTypeService extends LookupService<PriorityType> {
  constructor(prisma: PrismaService) {
    super(prisma.priorityType);
  }
}
