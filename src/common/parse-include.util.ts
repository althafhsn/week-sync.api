import { BadRequestException } from '@nestjs/common';

export interface IncludeOption {
  field: string;
  value: unknown;
}

export function parseInclude<TInclude extends object>(
  include: string | undefined,
  mapping: Record<string, IncludeOption>,
): TInclude | undefined {
  if (!include) {
    return undefined;
  }

  const lowercasedMapping = new Map(Object.entries(mapping).map(([key, option]) => [key.toLowerCase(), option]));

  const requested = include
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

  const result: Record<string, unknown> = {};
  for (const key of requested) {
    const option = lowercasedMapping.get(key.toLowerCase());
    if (!option) {
      throw new BadRequestException(`Unknown include "${key}". Allowed values: ${Object.keys(mapping).join(', ')}`);
    }
    result[option.field] = option.value;
  }

  return Object.keys(result).length ? (result as TInclude) : undefined;
}
