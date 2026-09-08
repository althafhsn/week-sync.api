import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsInt()
  userStatusId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsBoolean()
  mustChangePassword: boolean;

}