import { IsNumber, IsUUID } from 'class-validator';

export class CreateReportHoursDto {
  @IsUUID()
  reportVersionId: string;

  @IsUUID()
  reportHourTypeId: string;

  @IsNumber()
  hours: number;
}
