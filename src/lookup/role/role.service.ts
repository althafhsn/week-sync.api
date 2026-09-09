import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class RoleService extends LookupService<Role> {
  constructor(prisma: PrismaService) {
    super(prisma.role);
  }
}
