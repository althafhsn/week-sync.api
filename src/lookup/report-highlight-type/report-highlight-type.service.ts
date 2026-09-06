import { Injectable } from '@nestjs/common';
import { ReportHighlightType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';
import { CreateReportHighlightTypeDto } from './dto/create-report-highlight-type.dto.js';
import { UpdateReportHighlightTypeDto } from './dto/update-report-highlight-type.dto.js';

@Injectable()
export class ReportHighlightTypeService extends LookupService<
  ReportHighlightType,
  CreateReportHighlightTypeDto,
  UpdateReportHighlightTypeDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.reportHighlightType, 'Report highlight type');
  }
}
