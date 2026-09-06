import { Prisma } from '@prisma/client';

const POSTGRES_RESTRICT_VIOLATION = '23001';

export function isRestrictViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientUnknownRequestError && error.message.includes(POSTGRES_RESTRICT_VIOLATION);
}
