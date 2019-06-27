import { IsNotEmpty, Length } from 'class-validator';

import { MatchesProperty } from '../../commons/decorators';

export class ChangePasswordBody {
  @IsNotEmpty()
  readonly currentPassword: string;

  @IsNotEmpty()
  @Length(4, 128)
  @MatchesProperty('confirmNewPassword')
  readonly newPassword: string;

  @MatchesProperty('newPassword')
  readonly confirmNewPassword: string;
}
