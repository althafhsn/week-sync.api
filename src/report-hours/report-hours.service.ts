import { Injectable, NotFoundException } from '@nestjs/common';
import { FindReportHoursDto } from './dto/find-report-hours.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

@Injectable()
export class ReportHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FindReportHoursDto) {
    const where = { reportId: filter.reportId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.reportHours.findMany({ where, skip: pagination.skip, take: pagination.take }),
      this.prisma.reportHours.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const reportHours = await this.prisma.reportHours.findUnique({ where: { id } });
    if (!reportHours) {
      throw new NotFoundException(`Report hours entry with id "${id}" not found`);
    }
    return reportHours;
  }
}
