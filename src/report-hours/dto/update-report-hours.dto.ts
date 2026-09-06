import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReportHoursDto } from './create-report-hours.dto.js';

export class UpdateReportHoursDto extends PartialType(OmitType(CreateReportHoursDto, ['reportVersionId'] as const)) {}
