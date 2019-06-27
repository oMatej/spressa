import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendEmailBody {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
