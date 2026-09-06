import { IsUUID } from 'class-validator';

export class IdRefDto {
  @IsUUID()
  id: string;
}
