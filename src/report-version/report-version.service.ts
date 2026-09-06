import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportVersionDto } from './dto/create-report-version.dto.js';
import { UpdateReportVersionDto } from './dto/update-report-version.dto.js';
import { FindReportVersionsDto } from './dto/find-report-versions.dto.js';
import { isRestrictViolation } from '../common/prisma-error.util.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';

@Injectable()
export class ReportVersionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportVersionDto) {
    const { reportId, startDate, endDate, ...versionData } = dto;

    try {
      const [, reportVersion] = await this.prisma.$transaction([
        this.prisma.report.update({
          where: { id: reportId },
          data: { currentVersion: { increment: 1 } },
        }),
        this.prisma.reportVersion.create({
          data: { ...versionData, reportId, startDate: new Date(startDate), endDate: new Date(endDate) },
        }),
      ]);
      return reportVersion;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report with id "${reportId}" not found`);
      }
      throw error;
    }
  }

  async findAll(filter: FindReportVersionsDto) {
    const where = { reportId: filter.reportId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.reportVersion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.reportVersion.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const reportVersion = await this.prisma.reportVersion.findUnique({
      where: { id },
      include: {
        reportStatus: true,
        tasks: true,
        reportHighlights: true,
        reportHours: true,
        reportReviewAction: true,
      },
    });
    if (!reportVersion) {
      throw new NotFoundException(`Report version with id "${id}" not found`);
    }
    return reportVersion;
  }

  async update(id: string, dto: UpdateReportVersionDto) {
    const { startDate, endDate, ...rest } = dto;

    try {
      return await this.prisma.reportVersion.update({
        where: { id },
        data: {
          ...rest,
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report version with id "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.reportVersion.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report version with id "${id}" not found`);
      }
      if (isRestrictViolation(error)) {
        throw new ConflictException('Cannot delete this report version because it still has tasks, highlights, hours, or a review action');
      }
      throw error;
    }
  }
}
