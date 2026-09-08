import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FindReportHoursDto } from './dto/find-report-hours.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';
import { AuthenticatedUser, isManagerRole } from '../common/report-access.util.js';

@Injectable()
export class ReportHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FindReportHoursDto, caller: AuthenticatedUser) {
    const callerIsManager = await isManagerRole(this.prisma, caller.roleId);
    if (filter.reportId) {
      const report = await this.prisma.report.findUnique({ where: { id: filter.reportId }, select: { userId: true } });
      if (!report) {
        throw new NotFoundException(`Report with id "${filter.reportId}" not found`);
      }
      if (!callerIsManager && report.userId !== caller.sub) {
        throw new ForbiddenException('You do not have access to this report');
      }
    }

    const where: Prisma.ReportHoursWhereInput = {
      reportId: filter.reportId,
      ...(!callerIsManager && { report: { userId: caller.sub } }),
    };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.reportHours.findMany({ where, skip: pagination.skip, take: pagination.take }),
      this.prisma.reportHours.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string, caller: AuthenticatedUser) {
    const reportHours = await this.prisma.reportHours.findUnique({
      where: { id },
      include: { report: { select: { userId: true } } },
    });
    if (!reportHours) {
      throw new NotFoundException(`Report hours entry with id "${id}" not found`);
    }
    const callerIsManager = await isManagerRole(this.prisma, caller.roleId);
    if (!callerIsManager && reportHours.report.userId !== caller.sub) {
      throw new ForbiddenException('You do not have access to this report');
    }
    const { report: _report, ...rest } = reportHours;
    return rest;
  }
}
