import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportHighlightDto } from './dto/create-report-highlight.dto.js';
import { UpdateReportHighlightDto } from './dto/update-report-highlight.dto.js';
import { FindReportHighlightsDto } from './dto/find-report-highlights.dto.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class ReportHighlightService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportHighlightDto) {
    try {
      return await this.prisma.reportHighlight.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === FOREIGN_KEY_VIOLATION) {
        throw new NotFoundException('Report version or report highlight type not found');
      }
      throw error;
    }
  }

  async findAll(filter: FindReportHighlightsDto) {
    const where = { reportVersionId: filter.reportVersionId };
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

  async update(id: string, dto: UpdateReportHighlightDto) {
    try {
      return await this.prisma.reportHighlight.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Report highlight with id "${id}" not found`);
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('Report highlight type not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.reportHighlight.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report highlight with id "${id}" not found`);
      }
      throw error;
    }
  }
}
