import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuthenticatedUser {
  sub: string;
  roleId: number;
}

/** Resolves the caller's role name from their JWT's `roleId` claim. */
export async function isManagerRole(prisma: PrismaService, roleId: number): Promise<boolean> {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  return role?.name === 'Manager';
}

/** Throws unless the caller owns the report or is a Manager. */
export function assertReportAccess(reportUserId: string, caller: AuthenticatedUser, callerIsManager: boolean): void {
  if (!callerIsManager && reportUserId !== caller.sub) {
    throw new ForbiddenException('You do not have access to this report');
  }
}
