import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReportHighlightDto } from './create-report-highlight.dto.js';

export class UpdateReportHighlightDto extends PartialType(OmitType(CreateReportHighlightDto, ['reportVersionId'] as const)) {}
