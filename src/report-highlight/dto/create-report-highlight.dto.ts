import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateReportHighlightDto {
  @IsUUID()
  reportVersionId: string;

  @IsUUID()
  reportHighlightTypeId: string;

  @IsOptional()
  @IsBoolean()
  isKey?: boolean;
}
