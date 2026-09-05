import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProjectModule } from './project/project.module.js';

@Module({
  imports: [PrismaModule, ProjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
