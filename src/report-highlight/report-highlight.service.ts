import { Injectable, NotFoundException } from '@nestjs/common';
import { FindReportHighlightsDto } from './dto/find-report-highlights.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

@Injectable()
export class ReportHighlightService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FindReportHighlightsDto) {
    const where = { reportId: filter.reportId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.reportHighlight.findMany({ where, skip: pagination.skip, take: pagination.take }),
      this.prisma.reportHighlight.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const reportHighlight = await this.prisma.reportHighlight.findUnique({ where: { id } });
    if (!reportHighlight) {
      throw new NotFoundException(`Report highlight with id "${id}" not found`);
    }
    return reportHighlight;
  }
}
