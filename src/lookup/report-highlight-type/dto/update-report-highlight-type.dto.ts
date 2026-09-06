import { PartialType } from '@nestjs/mapped-types';
import { CreateReportHighlightTypeDto } from './create-report-highlight-type.dto.js';

export class UpdateReportHighlightTypeDto extends PartialType(CreateReportHighlightTypeDto) {}
