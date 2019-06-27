import { IsAlphanumeric, IsEmail, IsNotEmpty, Length } from 'class-validator';

import { MatchesProperty } from '../../commons/decorators';

export class CreateAccount {
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @Length(4, 128)
  readonly password: string;

  @MatchesProperty('password')
  readonly confirmPassword: string;
}
