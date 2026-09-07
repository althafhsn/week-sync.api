import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProjectModule } from './project/project.module.js';
import { AuthModule } from './Auth/auth.module.js';
import { UserModule } from './User/user.module.js';
import { UserProjectModule } from './user-project/user-project.module.js';
import { RoleModule } from './lookup/role/role.module.js';
import { ProjectStatusModule } from './lookup/project-status/project-status.module.js';
import { ReportStatusModule } from './lookup/report-status/report-status.module.js';
import { PriorityTypeModule } from './lookup/priority-type/priority-type.module.js';
import { TaskStatusModule } from './lookup/task-status/task-status.module.js';
import { ReportHighlightTypeModule } from './lookup/report-highlight-type/report-highlight-type.module.js';
import { ReportHourTypeModule } from './lookup/report-hour-type/report-hour-type.module.js';
import { ReportModule } from './report/report.module.js';
import { TaskModule } from './task/task.module.js';
import { ReportHighlightModule } from './report-highlight/report-highlight.module.js';
import { ReportHoursModule } from './report-hours/report-hours.module.js';

@Module({
  imports: [
    PrismaModule,
    ProjectModule,
    UserModule,
    AuthModule,
    UserProjectModule,
    RoleModule,
    ProjectStatusModule,
    ReportStatusModule,
    PriorityTypeModule,
    TaskStatusModule,
    ReportHighlightTypeModule,
    ReportHourTypeModule,
    ReportModule,
    TaskModule,
    ReportHighlightModule,
    ReportHoursModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
