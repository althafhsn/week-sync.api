import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReportVersionDto } from './create-report-version.dto.js';

export class UpdateReportVersionDto extends PartialType(OmitType(CreateReportVersionDto, ['reportId'] as const)) {}
