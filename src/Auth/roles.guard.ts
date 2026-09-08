import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service.js';
import { ROLES_KEY } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const roleId = request.user?.roleId;
    if (roleId === undefined) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role || !required.includes(role.name)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
