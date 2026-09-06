import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class FindTasksDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  reportVersionId?: string;
}
