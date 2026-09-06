import { IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  projectId: string;
}
