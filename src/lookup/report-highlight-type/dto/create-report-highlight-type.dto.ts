import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReportHighlightCategory } from '@prisma/client';

export class CreateReportHighlightTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsEnum(ReportHighlightCategory)
  category: ReportHighlightCategory;
}
