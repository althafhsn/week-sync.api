import { Project as PrismaProject } from '@prisma/client';

export class Project implements PrismaProject {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
}
