import { Project as PrismaProject } from '@prisma/client';

export class Project implements PrismaProject {
  id: string;
  name: string;
  description: string | null;
  projectStatusId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
