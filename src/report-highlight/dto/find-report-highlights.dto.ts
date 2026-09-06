import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class FindReportHighlightsDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  reportVersionId?: string;
}
