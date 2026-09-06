import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LookupService } from '../../common/lookup/lookup.service.js';
import { CreateLookupDto } from '../../common/lookup/dto/create-lookup.dto.js';
import { UpdateLookupDto } from '../../common/lookup/dto/update-lookup.dto.js';

@Injectable()
export class ProjectStatusService extends LookupService<ProjectStatus, CreateLookupDto, UpdateLookupDto> {
  constructor(prisma: PrismaService) {
    super(prisma.projectStatus, 'Project status');
  }
}
