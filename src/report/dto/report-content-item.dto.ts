import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class TaskInputDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsInt()
  priorityTypeId: number;

  @IsInt()
  taskStatusId: number;

  @IsOptional()
  @IsInt()
  planned?: number;

  @IsOptional()
  @IsInt()
  actual?: number;

  @IsOptional()
  @IsInt()
  plannedHour?: number;

  @IsOptional()
  @IsInt()
  actualHour?: number;

  @IsOptional()
  @IsString()
  deliverable?: string;

  // Round-trip-only fields: present when this item came from a GET response, ignored on write.
  @IsOptional()
  reportId?: unknown;

  @IsOptional()
  priorityType?: unknown;

  @IsOptional()
  taskStatus?: unknown;
}

export class NextWeekTaskInputDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  reportId?: unknown;
}

export class HighlightInputDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsInt()
  reportHighlightTypeId: number;

  @IsOptional()
  @IsBoolean()
  isKey?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  reportId?: unknown;

  @IsOptional()
  reportHighlightType?: unknown;
}

export class HoursInputDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsInt()
  reportHourTypeId: number;

  @Type(() => Number)
  @IsNumber()
  hours: number;

  @IsOptional()
  reportId?: unknown;

  @IsOptional()
  reportHourType?: unknown;
}
