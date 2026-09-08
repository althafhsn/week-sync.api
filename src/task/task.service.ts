import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FindTasksDto } from './dto/find-tasks.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';
import { AuthenticatedUser, isManagerRole } from '../common/report-access.util.js';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FindTasksDto, caller: AuthenticatedUser) {
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

    const where: Prisma.TaskWhereInput = {
      reportId: filter.reportId,
      ...(!callerIsManager && { report: { userId: caller.sub } }),
    };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.task.findMany({ where, skip: pagination.skip, take: pagination.take }),
      this.prisma.task.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string, caller: AuthenticatedUser) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { report: { select: { userId: true } } },
    });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    const callerIsManager = await isManagerRole(this.prisma, caller.roleId);
    if (!callerIsManager && task.report.userId !== caller.sub) {
      throw new ForbiddenException('You do not have access to this report');
    }
    const { report: _report, ...rest } = task;
    return rest;
  }
}
