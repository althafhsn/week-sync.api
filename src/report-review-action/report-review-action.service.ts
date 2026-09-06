import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportReviewActionDto } from './dto/create-report-review-action.dto.js';
import { UpdateReportReviewActionDto } from './dto/update-report-review-action.dto.js';
import { FindReportReviewActionsDto } from './dto/find-report-review-actions.dto.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';
const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class ReportReviewActionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportReviewActionDto) {
    try {
      return await this.prisma.reportReviewAction.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException('This report version already has a review action');
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('Report version or review action type not found');
        }
      }
      throw error;
    }
  }

  async findAll(filter: FindReportReviewActionsDto) {
    const where = { reportVersionId: filter.reportVersionId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.reportReviewAction.findMany({ where, skip: pagination.skip, take: pagination.take }),
      this.prisma.reportReviewAction.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const reviewAction = await this.prisma.reportReviewAction.findUnique({ where: { id } });
    if (!reviewAction) {
      throw new NotFoundException(`Report review action with id "${id}" not found`);
    }
    return reviewAction;
  }

  async update(id: string, dto: UpdateReportReviewActionDto) {
    try {
      return await this.prisma.reportReviewAction.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Report review action with id "${id}" not found`);
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('Review action type not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.reportReviewAction.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report review action with id "${id}" not found`);
      }
      throw error;
    }
  }
}
