import { PaginatedResult, RawPaginationQuery, resolvePagination, toPaginatedResult } from '../pagination.util.js';

export interface LookupDelegate<T> {
  findMany(args?: { skip?: number; take?: number }): Promise<T[]>;
  count(): Promise<number>;
}

export class LookupService<T> {
  constructor(private readonly delegate: LookupDelegate<T>) {}

  async findAll(query?: RawPaginationQuery): Promise<PaginatedResult<T>> {
    const pagination = resolvePagination(query);
    const [data, count] = await Promise.all([
      this.delegate.findMany({ skip: pagination.skip, take: pagination.take }),
      this.delegate.count(),
    ]);
    return toPaginatedResult(data, count, pagination);
  }
}
