import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const diffToMonday = (now.getDay() + 6) % 7;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const [activeMembers, liveProjects, reportsThisWeek] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.project.count({ where: { isActive: true } }),
      this.prisma.report.count({
        where: {
          createdAt: { gte: weekStart, lt: weekEnd },
          reportStatus: { name: { not: 'Draft' } },
        },
      }),
    ]);

    return { activeMembers, liveProjects, reportsThisWeek };
  }
}
