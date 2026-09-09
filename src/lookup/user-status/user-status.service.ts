import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class UserStatusService extends LookupService<UserStatus> {
  constructor(prisma: PrismaService) {
    super(prisma.userStatus);
  }
}
