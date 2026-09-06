import { IsArray, IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IdRefDto } from '../../common/dto/id-ref.dto.js';
import { UserProjectRefDto } from './user-project-ref.dto.js';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => IdRefDto)
  projectStatus: IdRefDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserProjectRefDto)
  userProjects?: UserProjectRefDto[];
}
