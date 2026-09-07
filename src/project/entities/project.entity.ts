import { Project as PrismaProject } from '@prisma/client';

export class Project implements PrismaProject {
  id: string;
  name: string;
  description: string | null;
  projectStatusId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
