import { BadRequestException } from '@nestjs/common';
import { isUUID, isDateString } from 'class-validator';

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

export function getIntFilterParam(query: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = getFilterParam(query, key);
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new BadRequestException(`"${key}" must be an integer`);
  }
  return parsed;
}

export function getDateFilterParam(query: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = getFilterParam(query, key);
  if (value !== undefined && !isDateString(value)) {
    throw new BadRequestException(`"${key}" must be a valid date`);
  }
  return value;
}
