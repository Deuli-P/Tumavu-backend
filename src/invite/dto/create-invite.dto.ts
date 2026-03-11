import { IsEmail, IsInt, IsPositive } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  email!: string;

  @IsInt()
  @IsPositive()
  offerId!: number;
}
