import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isRestrictViolation } from '../prisma-error.util.js';
import { PaginatedResult, RawPaginationQuery, resolvePagination, toPaginatedResult } from '../pagination.util.js';

const RECORD_NOT_FOUND = 'P2025';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

export interface LookupDelegate<T, TCreate, TUpdate> {
  findMany(args?: { skip?: number; take?: number }): Promise<T[]>;
  count(): Promise<number>;
  findUnique(args: { where: { id: number } }): Promise<T | null>;
  create(args: { data: TCreate }): Promise<T>;
  update(args: { where: { id: number }; data: TUpdate }): Promise<T>;
  delete(args: { where: { id: number } }): Promise<T>;
}

export class LookupService<T, TCreate extends { name: string }, TUpdate extends { name?: string }> {
  constructor(
    private readonly delegate: LookupDelegate<T, TCreate, TUpdate>,
    private readonly label: string,
  ) {}

  async findAll(query?: RawPaginationQuery): Promise<PaginatedResult<T>> {
    const pagination = resolvePagination(query);
    const [data, count] = await Promise.all([
      this.delegate.findMany({ skip: pagination.skip, take: pagination.take }),
      this.delegate.count(),
    ]);
    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: number): Promise<T> {
    const record = await this.delegate.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`${this.label} with id "${id}" not found`);
    }
    return record;
  }

  async create(dto: TCreate): Promise<T> {
    try {
      return await this.delegate.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException(`A ${this.label.toLowerCase()} named "${dto.name}" already exists`);
      }
      throw error;
    }
  }

  async update(id: number, dto: TUpdate): Promise<T> {
    try {
      return await this.delegate.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`${this.label} with id "${id}" not found`);
        }
        if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException(`A ${this.label.toLowerCase()} named "${dto.name}" already exists`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<T> {
    try {
      return await this.delegate.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`${this.label} with id "${id}" not found`);
      }
      if (isRestrictViolation(error)) {
        throw new ConflictException(`Cannot delete this ${this.label.toLowerCase()} because other records still reference it`);
      }
      throw error;
    }
  }
}
