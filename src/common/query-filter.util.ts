import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

export function getFilterParam(query: Record<string, unknown> | undefined, key: string): string | undefined {
  if (!query) {
    return undefined;
  }

  const target = key.toLowerCase();
  for (const [k, v] of Object.entries(query)) {
    if (k.toLowerCase() === target && typeof v === 'string' && v.length > 0) {
      return v;
    }
  }
  return undefined;
}

export function getUuidFilterParam(query: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = getFilterParam(query, key);
  if (value !== undefined && !isUUID(value)) {
    throw new BadRequestException(`"${key}" must be a UUID`);
  }
  return value;
}
