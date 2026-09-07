import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { RoleService } from './role.service.js';
import { RoleController } from './role.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
