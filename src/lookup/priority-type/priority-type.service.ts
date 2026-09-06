import { Injectable } from '@nestjs/common';
import { PriorityType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';
import { CreateLookupDto } from '../../common/lookup/dto/create-lookup.dto.js';
import { UpdateLookupDto } from '../../common/lookup/dto/update-lookup.dto.js';

@Injectable()
export class PriorityTypeService extends LookupService<PriorityType, CreateLookupDto, UpdateLookupDto> {
  constructor(prisma: PrismaService) {
    super(prisma.priorityType, 'Priority type');
  }
}
