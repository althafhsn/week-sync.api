import {
  ConflictException,
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
  isActive: true,
  mustChangePassword: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const AUTH_INCLUDE_MAP = {
  role: { field: 'role', value: true },
};

const USER_INCLUDE_MAP = {
  ...AUTH_INCLUDE_MAP,
  projects: {
    field: 'userProjects',
    value: {
      include: {
        project: true,
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

  async create(createUserDto: CreateUserDto, include?: string) {
    const { password, ...userData } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      return await this.prisma.user.create({
        data: {
          ...userData,
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

  async findOne(id: string, include?: string) {
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
      include: parseInclude<Prisma.UserInclude>(include, AUTH_INCLUDE_MAP),
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, include?: string) {
    const { password, ...userData } = updateUserDto;

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...userData,
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
