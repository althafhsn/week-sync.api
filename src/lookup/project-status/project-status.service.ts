import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';

@Injectable()
export class ProjectStatusService extends LookupService<ProjectStatus> {
  constructor(prisma: PrismaService) {
    super(prisma.projectStatus);
  }
}
