import { IsEmail } from 'class-validator';

export class InviteToJobDto {
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;
}
