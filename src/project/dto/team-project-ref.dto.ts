import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IdRefDto } from '../../common/dto/id-ref.dto.js';

export class TeamProjectRefDto {
  @ValidateNested()
  @Type(() => IdRefDto)
  team: IdRefDto;
}
