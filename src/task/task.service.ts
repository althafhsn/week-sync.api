import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { FindTasksDto } from './dto/find-tasks.dto.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    try {
      return await this.prisma.task.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === FOREIGN_KEY_VIOLATION) {
        throw new NotFoundException('Report version, priority type, or task status not found');
      }
      throw error;
    }
  }

  async findAll(filter: FindTasksDto) {
    const where = { reportVersionId: filter.reportVersionId };
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

  async update(id: string, dto: UpdateTaskDto) {
    try {
      return await this.prisma.task.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Task with id "${id}" not found`);
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('Priority type or task status not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Task with id "${id}" not found`);
      }
      throw error;
    }
  }
}
