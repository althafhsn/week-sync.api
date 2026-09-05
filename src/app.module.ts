import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProjectModule } from './project/project.module.js';
import { AuthModule } from './Auth/auth.module.js';
import { UserModule } from './User/user.module.js';

@Module({
  imports: [PrismaModule, ProjectModule, UserModule, AuthModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
