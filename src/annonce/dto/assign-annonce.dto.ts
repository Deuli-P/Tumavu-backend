import { IsString, IsUUID } from 'class-validator';

export class AssignAnnonceDto {
  @IsString()
  @IsUUID()
  userId!: string;
}
