import { IsAlphanumeric, IsEmail, IsNotEmpty, Length } from 'class-validator';

import { MatchesProperty } from '../../commons/decorators';

export class CreateAccountBody {
  @IsNotEmpty()
  @IsAlphanumeric()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @Length(4, 128)
  readonly password: string;

  @IsNotEmpty()
  @MatchesProperty('password')
  readonly confirmPassword: string;
}
