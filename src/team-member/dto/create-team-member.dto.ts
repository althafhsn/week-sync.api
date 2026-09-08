import { IsUUID } from 'class-validator';

export class CreateTeamMemberDto {
  @IsUUID()
  teamId: string;

  @IsUUID()
  userId: string;
}
