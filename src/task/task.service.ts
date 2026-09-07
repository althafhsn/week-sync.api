import { Injectable, NotFoundException } from '@nestjs/common';
import { FindTasksDto } from './dto/find-tasks.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FindTasksDto) {
    const where = { reportId: filter.reportId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.task.findMany({ where, skip: pagination.skip, take: pagination.take }),
      this.prisma.task.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }
}
