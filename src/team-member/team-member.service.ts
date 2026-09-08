import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { FindTeamMembersDto } from './dto/find-team-members.dto.js';
import { resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class TeamMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto) {
    try {
      return await this.prisma.teamMember.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException('This user is already a member of this team');
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('Team or user not found');
        }
      }
      throw error;
    }
  }

  async findAll(filter: FindTeamMembersDto) {
    const where = { teamId: filter.teamId, userId: filter.userId };
    const pagination = resolvePagination(filter);

    const [data, count] = await Promise.all([
      this.prisma.teamMember.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          team: { select: { id: true, name: true } },
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.teamMember.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });
    if (!teamMember) {
      throw new NotFoundException(`Team member assignment with id "${id}" not found`);
    }
    return teamMember;
  }

  async remove(id: string) {
    try {
      return await this.prisma.teamMember.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Team member assignment with id "${id}" not found`);
      }
      throw error;
    }
  }
}
