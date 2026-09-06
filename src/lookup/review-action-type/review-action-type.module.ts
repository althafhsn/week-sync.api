import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/auth.module.js';
import { ReviewActionTypeService } from './review-action-type.service.js';
import { ReviewActionTypeController } from './review-action-type.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ReviewActionTypeController],
  providers: [ReviewActionTypeService],
})
export class ReviewActionTypeModule {}
