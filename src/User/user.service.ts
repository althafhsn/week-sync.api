import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './DTO/create-user.dto.js';
import { UpdateUserDto } from './DTO/update-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { parseInclude } from '../common/parse-include.util.js';
import { RawPaginationQuery, resolvePagination, toPaginatedResult } from '../common/pagination.util.js';

const USER_LIST_SELECT = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  jobTitle: true,
  isActive: true,
  mustChangePassword: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const AUTH_INCLUDE_MAP = {
  role: { field: 'role', value: true },
};

const USER_INCLUDE_MAP = {
  ...AUTH_INCLUDE_MAP,
  userStatus: { field: 'userStatus', value: true },
  projects: {
    field: 'userProjects',
    value: {
      include: {
        project: true,
      },
    },
  },
  team: {
    field: 'teamMembers',
    value: {
      include: {
        team: { select: { id: true, name: true } },
      },
    },
  },
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSelect(include?: string) {
    return {
      ...USER_LIST_SELECT,
      ...parseInclude<Partial<Prisma.UserSelect>>(include, USER_INCLUDE_MAP),
    };
  }

  private async getStatusIdByName(name: string): Promise<number> {
    const status = await this.prisma.userStatus.findUnique({ where: { name } });
    if (!status) {
      throw new NotFoundException(`User status "${name}" is not configured`);
    }
    return status.id;
  }

  async create(createUserDto: CreateUserDto, include?: string) {
    const { password, userStatusId, ...userData } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 12);
    const resolvedUserStatusId = userStatusId ?? (await this.getStatusIdByName('Approved'));

    try {
      return await this.prisma.user.create({
        data: {
          ...userData,
          userStatusId: resolvedUserStatusId,
          passwordHash,
          mustChangePassword: true,
        },
        select: this.buildSelect(include),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email is already registered');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Role not found');
        }
      }
      throw error;
    }
  }

  async findAll(include?: string, pageQuery?: RawPaginationQuery) {
    const pagination = resolvePagination(pageQuery);
    const [data, count] = await Promise.all([
      this.prisma.user.findMany({ select: this.buildSelect(include), skip: pagination.skip, take: pagination.take }),
      this.prisma.user.count(),
    ]);
    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string, include?: string, caller?: { sub: string; roleId: number }) {
    if (caller && caller.sub !== id) {
      const callerRole = await this.prisma.role.findUnique({ where: { id: caller.roleId } });
      if (callerRole?.name !== 'Manager') {
        throw new ForbiddenException('You can only view your own profile');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.buildSelect(include),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findByEmail(email: string, include?: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        ...parseInclude<Prisma.UserInclude>(include, AUTH_INCLUDE_MAP),
        userStatus: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, include?: string, caller?: { sub: string; roleId: number }) {
    const { password, userStatusId, ...userData } = updateUserDto;

    if (caller) {
      const callerRole = await this.prisma.role.findUnique({ where: { id: caller.roleId } });
      const callerIsManager = callerRole?.name === 'Manager';

      if (!callerIsManager) {
        if (caller.sub !== id) {
          throw new ForbiddenException('You can only update your own profile');
        }
        const managerOnlyFields = ['roleId', 'isActive'] as const;
        for (const field of managerOnlyFields) {
          if (updateUserDto[field] !== undefined) {
            throw new ForbiddenException('Only a Manager can change role or active status');
          }
        }
        if (userStatusId !== undefined) {
          throw new ForbiddenException("Only a Manager can change a user's approval status");
        }
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...userData,
          ...(userStatusId !== undefined && { userStatusId }),
          ...(password && { passwordHash: await bcrypt.hash(password, 12) }),
        },
        select: this.buildSelect(include),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Email is already registered');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Role not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
        select: USER_LIST_SELECT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
