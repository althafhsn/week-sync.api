import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { FindReportsDto } from './dto/find-reports.dto.js';
import { isRestrictViolation } from '../common/prisma-error.util.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  create(createReportDto: CreateReportDto) {
    return this.prisma.report.create({ data: createReportDto });
  }

  async findAll(filter: FindReportsDto) {
    const where = { userId: filter.userId, projectId: filter.projectId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.report.findMany({ where, skip: pagination.skip, take: pagination.take }),
      this.prisma.report.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reportVersions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    try {
      return await this.prisma.report.update({ where: { id }, data: updateReportDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report with id "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.report.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report with id "${id}" not found`);
      }
      if (isRestrictViolation(error)) {
        throw new ConflictException('Cannot delete this report because it still has report versions');
      }
      throw error;
    }
  }
}
