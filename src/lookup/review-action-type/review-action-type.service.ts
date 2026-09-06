import { Injectable } from '@nestjs/common';
import { ReviewActionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';
import { CreateLookupDto } from '../../common/lookup/dto/create-lookup.dto.js';
import { UpdateLookupDto } from '../../common/lookup/dto/update-lookup.dto.js';

@Injectable()
export class ReviewActionTypeService extends LookupService<ReviewActionType, CreateLookupDto, UpdateLookupDto> {
  constructor(prisma: PrismaService) {
    super(prisma.reviewActionType, 'Review action type');
  }
}
