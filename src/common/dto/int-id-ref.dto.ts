import { IsInt } from 'class-validator';

export class IntIdRefDto {
  @IsInt()
  id: number;
}
