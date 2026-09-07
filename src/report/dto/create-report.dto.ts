import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TaskInputDto, NextWeekTaskInputDto, HighlightInputDto, HoursInputDto } from './report-content-item.dto.js';

export class CreateReportDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  projectId: string;

  @IsInt()
  reportStatusId: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  links?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskInputDto)
  tasks?: TaskInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NextWeekTaskInputDto)
  reportNextWeekTasks?: NextWeekTaskInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HighlightInputDto)
  reportHighlights?: HighlightInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoursInputDto)
  reportHours?: HoursInputDto[];

  // Round-trip-only fields: present when this body came from a GET response, ignored on write.
  @IsOptional()
  id?: unknown;

  @IsOptional()
  createdAt?: unknown;

  @IsOptional()
  updatedAt?: unknown;

  @IsOptional()
  user?: unknown;

  @IsOptional()
  project?: unknown;

  @IsOptional()
  reportStatus?: unknown;
}
