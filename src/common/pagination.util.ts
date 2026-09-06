import { BadRequestException } from '@nestjs/common';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface RawPaginationQuery {
  page?: string;
  pageSize?: string;
}

export interface PaginationArgs {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

function parsePositiveInt(value: string | undefined, label: string, fallback: number, max?: number): number {
  if (value === undefined) {
    return fallback;
  }
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    throw new BadRequestException(`"${label}" must be a positive integer`);
  }
  if (max !== undefined && num > max) {
    throw new BadRequestException(`"${label}" must be ${max} or less`);
  }
  return num;
}

export function resolvePagination(query?: RawPaginationQuery): PaginationArgs {
  const page = parsePositiveInt(query?.page, 'page', 1);
  const pageSize = parsePositiveInt(query?.pageSize, 'pageSize', DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function toPaginatedResult<T>(data: T[], count: number, pagination: PaginationArgs): PaginatedResult<T> {
  return { data, count, page: pagination.page, pageSize: pagination.pageSize };
}
