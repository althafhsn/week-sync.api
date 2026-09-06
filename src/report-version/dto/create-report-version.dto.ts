import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReportVersionDto {
  @IsUUID()
  reportId: string;

  @IsUUID()
  reportStatusId: string;

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
}
