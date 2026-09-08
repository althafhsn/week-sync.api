import { IsArray, IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IntIdRefDto } from '../../common/dto/int-id-ref.dto.js';
import { UserProjectRefDto } from './user-project-ref.dto.js';
import { TeamProjectRefDto } from './team-project-ref.dto.js';

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
  @Type(() => IntIdRefDto)
  projectStatus: IntIdRefDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserProjectRefDto)
  userProjects?: UserProjectRefDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamProjectRefDto)
  teamProjects?: TeamProjectRefDto[];
}
