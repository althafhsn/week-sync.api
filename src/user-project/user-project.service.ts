import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserProjectDto } from './dto/create-user-project.dto.js';
import { FindUserProjectsDto } from './dto/find-user-projects.dto.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class UserProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserProjectDto) {
    try {
      return await this.prisma.userProject.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException('This user is already assigned to this project');
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('User or project not found');
        }
      }
      throw error;
    }
  }

  async findAll(filter: FindUserProjectsDto) {
    const where = { userId: filter.userId, projectId: filter.projectId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.userProject.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.userProject.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const userProject = await this.prisma.userProject.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!userProject) {
      throw new NotFoundException(`User-project assignment with id "${id}" not found`);
    }
    return userProject;
  }

  async remove(id: string) {
    try {
      return await this.prisma.userProject.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`User-project assignment with id "${id}" not found`);
      }
      throw error;
    }
  }
}
