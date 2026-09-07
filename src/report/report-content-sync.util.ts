import { NotFoundException } from '@nestjs/common';

interface SyncOps<TData> {
  deleteMany(notInIds: string[]): Promise<unknown>;
  updateMany(id: string, data: TData): Promise<{ count: number }>;
  create(data: TData): Promise<unknown>;
}

/**
 * Reconciles a report's child rows (tasks/highlights/hours/next-week-tasks) against the
 * incoming array: items with an id update that exact row in place, items without an id
 * are created fresh, and existing rows whose id is missing from the array are deleted.
 *
 * `pick` is the single source of truth for which fields actually get written — it strips
 * round-trip-only fields (id, reportId, expanded relation objects) that GET responses
 * include but Prisma's create/update input types don't accept.
 */
export async function syncReportChildren<TItem extends { id?: string }, TData>(
  items: TItem[],
  pick: (item: TItem) => TData,
  ops: SyncOps<TData>,
  label: string,
) {
  const incomingIds = items.filter((item) => item.id).map((item) => item.id as string);

  await ops.deleteMany(incomingIds);

  for (const item of items) {
    const data = pick(item);
    if (item.id) {
      const result = await ops.updateMany(item.id, data);
      if (result.count === 0) {
        throw new NotFoundException(`${label} with id "${item.id}" not found on this report`);
      }
    } else {
      await ops.create(data);
    }
  }
}
