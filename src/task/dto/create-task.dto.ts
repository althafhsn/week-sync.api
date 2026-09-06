import { IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  reportVersionId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsUUID()
  priorityTypeId: string;

  @IsUUID()
  taskStatusId: string;

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
}
