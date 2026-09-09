import { Injectable } from '@nestjs/common';
import { ReportHighlightType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class ReportHighlightTypeService extends LookupService<ReportHighlightType> {
  constructor(prisma: PrismaService) {
    super(prisma.reportHighlightType);
  }
}
