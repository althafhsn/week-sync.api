import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReportReviewActionDto {
  @IsUUID()
  reportVersionId: string;

  @IsUUID()
  reviewActionTypeId: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
