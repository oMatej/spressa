import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class SignInBody {
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @Length(4, 128)
  readonly password: string;
}
