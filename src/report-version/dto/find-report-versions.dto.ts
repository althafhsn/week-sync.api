import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class FindReportVersionsDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  reportId?: string;
}
