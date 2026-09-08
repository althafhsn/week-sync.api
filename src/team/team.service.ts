import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { isRestrictViolation } from '../common/prisma-error.util.js';
import { parseInclude } from '../common/parse-include.util.js';
import { RawPaginationQuery, resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

const TEAM_INCLUDE_MAP = {
  members: {
    field: 'teamMembers',
    value: {
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    },
  },
  projects: {
    field: 'teamProjects',
    value: {
      include: {
        project: { select: { id: true, name: true } },
      },
    },
  },
};

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  private buildInclude(include?: string) {
    return parseInclude<Prisma.TeamInclude>(include, TEAM_INCLUDE_MAP);
  }

  async create(createTeamDto: CreateTeamDto, include?: string) {
    const { teamMembers, ...rest } = createTeamDto;
    const memberIds = (teamMembers ?? []).map((ref) => ref.user.id);

    try {
      return await this.prisma.team.create({
        data: {
          ...rest,
          teamMembers: {
            create: memberIds.map((userId) => ({
              user: { connect: { id: userId } },
            })),
          },
        },
        include: this.buildInclude(include),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException(`A team named "${createTeamDto.name}" already exists`);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException('One or more team members were not found');
      }
      throw error;
    }
  }

  async findAll(include?: string, filters?: { userId?: string }, pageQuery?: RawPaginationQuery) {
    const where: Prisma.TeamWhereInput = {
      ...(filters?.userId && { teamMembers: { some: { userId: filters.userId } } }),
    };
    const resolvedWhere = Object.keys(where).length ? where : undefined;
    const pagination = resolvePagination(pageQuery);

    const [data, count] = await Promise.all([
      this.prisma.team.findMany({
        where: resolvedWhere,
        include: this.buildInclude(include),
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.team.count({ where: resolvedWhere }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string, include?: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: this.buildInclude(include),
    });
    if (!team) {
      throw new NotFoundException(`Team with id "${id}" not found`);
    }
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto, include?: string) {
    const { teamMembers, ...rest } = updateTeamDto;

    try {
      if (teamMembers === undefined) {
        return await this.prisma.team.update({
          where: { id },
          data: rest,
          include: this.buildInclude(include),
        });
      }

      const memberIds = teamMembers.map((ref) => ref.user.id);
      const results = await this.prisma.$transaction([
        this.prisma.teamMember.deleteMany({
          where: { teamId: id, userId: { notIn: memberIds } },
        }),
        ...memberIds.map((userId) =>
          this.prisma.teamMember.upsert({
            where: { teamId_userId: { teamId: id, userId } },
            update: {},
            create: { teamId: id, userId },
          }),
        ),
        this.prisma.team.update({
          where: { id },
          data: rest,
          include: this.buildInclude(include),
        }),
      ]);
      return results[results.length - 1];
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Team with id "${id}" not found`);
        }
        if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException(`A team named "${updateTeamDto.name}" already exists`);
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('One or more team members were not found');
        }
      }
      if (isRestrictViolation(error)) {
        throw new ConflictException('Cannot remove one or more team members while they still have related records');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.team.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Team with id "${id}" not found`);
      }
      if (isRestrictViolation(error)) {
        throw new ConflictException('Cannot delete this team because it still has assigned members or projects');
      }
      throw error;
    }
  }
}
