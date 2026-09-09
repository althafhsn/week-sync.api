import { Injectable } from '@nestjs/common';
import { ReportHourType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class ReportHourTypeService extends LookupService<ReportHourType> {
  constructor(prisma: PrismaService) {
    super(prisma.reportHourType);
  }
}
