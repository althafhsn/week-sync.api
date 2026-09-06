import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProjectModule } from './project/project.module.js';
import { AuthModule } from './Auth/auth.module.js';
import { UserModule } from './User/user.module.js';
import { UserProjectModule } from './user-project/user-project.module.js';
import { ProjectStatusModule } from './lookup/project-status/project-status.module.js';
import { ReportStatusModule } from './lookup/report-status/report-status.module.js';
import { PriorityTypeModule } from './lookup/priority-type/priority-type.module.js';
import { TaskStatusModule } from './lookup/task-status/task-status.module.js';
import { ReviewActionTypeModule } from './lookup/review-action-type/review-action-type.module.js';
import { ReportHighlightTypeModule } from './lookup/report-highlight-type/report-highlight-type.module.js';
import { ReportHourTypeModule } from './lookup/report-hour-type/report-hour-type.module.js';
import { ReportModule } from './report/report.module.js';
import { ReportVersionModule } from './report-version/report-version.module.js';
import { TaskModule } from './task/task.module.js';
import { ReportHighlightModule } from './report-highlight/report-highlight.module.js';
import { ReportHoursModule } from './report-hours/report-hours.module.js';
import { ReportReviewActionModule } from './report-review-action/report-review-action.module.js';

@Module({
  imports: [
    PrismaModule,
    ProjectModule,
    UserModule,
    AuthModule,
    UserProjectModule,
    ProjectStatusModule,
    ReportStatusModule,
    PriorityTypeModule,
    TaskStatusModule,
    ReviewActionTypeModule,
    ReportHighlightTypeModule,
    ReportHourTypeModule,
    ReportModule,
    ReportVersionModule,
    TaskModule,
    ReportHighlightModule,
    ReportHoursModule,
    ReportReviewActionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
