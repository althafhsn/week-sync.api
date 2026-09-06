import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

const RECORD_NOT_FOUND = 'P2025';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
  const { teamMemberIds, ...projectData } = createProjectDto;

  try {
    return await this.prisma.project.create({
      data: {
        ...projectData,
        teamMembers: {
          create: teamMemberIds.map((userId) => ({
            user: {
              connect: { id: userId },
            },
          })),
        },
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        `A project named "${createProjectDto.name}" already exists`,
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('One or more team members were not found');
    }

    throw error;
  }
}

  findAll() {
    return this.prisma.project.findMany();
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      return await this.prisma.project.update({ where: { id }, data: updateProjectDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Project with id "${id}" not found`);
        }
        if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException(`A project named "${updateProjectDto.name}" already exists`);
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Project with id "${id}" not found`);
      }
      throw error;
    }
  }
}
