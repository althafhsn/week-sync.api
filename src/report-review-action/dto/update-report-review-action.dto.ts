import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReportReviewActionDto } from './create-report-review-action.dto.js';

export class UpdateReportReviewActionDto extends PartialType(
  OmitType(CreateReportReviewActionDto, ['reportVersionId'] as const),
) {}
