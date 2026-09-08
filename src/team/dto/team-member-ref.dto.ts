import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IdRefDto } from '../../common/dto/id-ref.dto.js';

export class TeamMemberRefDto {
  @ValidateNested()
  @Type(() => IdRefDto)
  user: IdRefDto;
}
