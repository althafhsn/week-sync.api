import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportHoursDto } from './dto/create-report-hours.dto.js';
import { UpdateReportHoursDto } from './dto/update-report-hours.dto.js';
import { FindReportHoursDto } from './dto/find-report-hours.dto.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class ReportHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportHoursDto) {
    try {
      return await this.prisma.reportHours.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === FOREIGN_KEY_VIOLATION) {
        throw new NotFoundException('Report version or report hour type not found');
      }
      throw error;
    }
  }

  async findAll(filter: FindReportHoursDto) {
    const where = { reportVersionId: filter.reportVersionId };
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

  async update(id: string, dto: UpdateReportHoursDto) {
    try {
      return await this.prisma.reportHours.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Report hours entry with id "${id}" not found`);
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('Report hour type not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.reportHours.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report hours entry with id "${id}" not found`);
      }
      throw error;
    }
  }
}
