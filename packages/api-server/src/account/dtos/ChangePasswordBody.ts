import { IsNotEmpty, Length } from 'class-validator';

import { MatchesProperty } from '../../commons/decorators';

export class ChangePasswordBody {
  @IsNotEmpty()
  readonly currentPassword: string;

  @IsNotEmpty()
  @Length(4, 128)
  @MatchesProperty('confirmPassword')
  readonly password: string;

  @MatchesProperty('password')
  readonly confirmPassword: string;
}
