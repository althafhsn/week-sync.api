import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { PriorityTypeService } from './priority-type.service.js';
import { PriorityTypeController } from './priority-type.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [PriorityTypeController],
  providers: [PriorityTypeService],
})
export class PriorityTypeModule {}
