import { IsUUID } from 'class-validator';

export class CreateUserProjectDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  projectId: string;
}
