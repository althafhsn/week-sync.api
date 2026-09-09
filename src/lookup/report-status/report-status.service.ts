import { Injectable } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class ReportStatusService extends LookupService<ReportStatus> {
  constructor(prisma: PrismaService) {
    super(prisma.reportStatus);
  }
}
