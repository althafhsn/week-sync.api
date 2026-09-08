import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { isRestrictViolation } from '../common/prisma-error.util.js';
import { parseInclude } from '../common/parse-include.util.js';
import { RawPaginationQuery, resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

const PROJECT_INCLUDE_MAP = {
  projectStatus: { field: 'projectStatus', value: true },
  users: {
    field: 'userProjects',
    value: {
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    },
  },
  teams: {
    field: 'teamProjects',
    value: {
      include: {
        team: { select: { id: true, name: true } },
      },
    },
  },
  reports: { field: 'reports', value: true },
};

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  private buildInclude(include?: string) {
    return parseInclude<Prisma.ProjectInclude>(include, PROJECT_INCLUDE_MAP);
  }

  async create(createProjectDto: CreateProjectDto, include?: string) {
    const { projectStatus, userProjects, teamProjects, ...rest } = createProjectDto;
    const teamMemberIds = (userProjects ?? []).map((ref) => ref.user.id);
    const teamIds = (teamProjects ?? []).map((ref) => ref.team.id);

    try {
      return await this.prisma.project.create({
        data: {
          ...rest,
          projectStatus: { connect: { id: projectStatus.id } },
          userProjects: {
            create: teamMemberIds.map((userId) => ({
              user: {
                connect: { id: userId },
              },
            })),
          },
          teamProjects: {
            create: teamIds.map((teamId) => ({
              team: {
                connect: { id: teamId },
              },
            })),
          },
        },
        include: this.buildInclude(include),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException(`A project named "${createProjectDto.name}" already exists`);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException('One or more team members or teams were not found');
      }
      throw error;
    }
  }

  async findAll(
    include?: string,
    filters?: { userId?: string; projectStatusId?: number },
    pageQuery?: RawPaginationQuery,
  ) {
    const where: Prisma.ProjectWhereInput = {
      ...(filters?.userId && {
        OR: [
          { userProjects: { some: { userId: filters.userId } } },
          { teamProjects: { some: { team: { teamMembers: { some: { userId: filters.userId } } } } } },
        ],
      }),
      ...(filters?.projectStatusId !== undefined && { projectStatusId: filters.projectStatusId }),
    };
    const resolvedWhere = Object.keys(where).length ? where : undefined;
    const pagination = resolvePagination(pageQuery);

    const [data, count] = await Promise.all([
      this.prisma.project.findMany({
        where: resolvedWhere,
        include: this.buildInclude(include),
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.project.count({ where: resolvedWhere }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string, include?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: this.buildInclude(include),
    });
    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, include?: string) {
    const { projectStatus, userProjects, teamProjects, ...rest } = updateProjectDto;
    const data: Prisma.ProjectUpdateInput = {
      ...rest,
      ...(projectStatus && { projectStatus: { connect: { id: projectStatus.id } } }),
    };

    try {
      if (userProjects === undefined && teamProjects === undefined) {
        return await this.prisma.project.update({
          where: { id },
          data,
          include: this.buildInclude(include),
        });
      }

      const ops: Prisma.PrismaPromise<unknown>[] = [];

      if (userProjects !== undefined) {
        const teamMemberIds = userProjects.map((ref) => ref.user.id);
        ops.push(
          this.prisma.userProject.deleteMany({
            where: { projectId: id, userId: { notIn: teamMemberIds } },
          }),
          ...teamMemberIds.map((userId) =>
            this.prisma.userProject.upsert({
              where: { userId_projectId: { userId, projectId: id } },
              update: {},
              create: { userId, projectId: id },
            }),
          ),
        );
      }

      if (teamProjects !== undefined) {
        const teamIds = teamProjects.map((ref) => ref.team.id);
        ops.push(
          this.prisma.teamProject.deleteMany({
            where: { projectId: id, teamId: { notIn: teamIds } },
          }),
          ...teamIds.map((teamId) =>
            this.prisma.teamProject.upsert({
              where: { teamId_projectId: { teamId, projectId: id } },
              update: {},
              create: { teamId, projectId: id },
            }),
          ),
        );
      }

      ops.push(
        this.prisma.project.update({
          where: { id },
          data,
          include: this.buildInclude(include),
        }),
      );

      const results = await this.prisma.$transaction(ops);
      return results[results.length - 1];
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Project with id "${id}" not found`);
        }
        if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException(`A project named "${updateProjectDto.name}" already exists`);
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('One or more team members or teams were not found');
        }
      }
      if (isRestrictViolation(error)) {
        throw new ConflictException('Cannot remove one or more team members or teams while they still have related records');
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
      if (isRestrictViolation(error)) {
        throw new ConflictException('Cannot delete this project because it still has assigned team members or reports');
      }
      throw error;
    }
  }
}
