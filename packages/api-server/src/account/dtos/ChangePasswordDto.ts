import { IsNotEmpty, Length } from 'class-validator';

import { MatchesProperty } from '../../commons/decorators';

export class ChangePasswordDto {
  @IsNotEmpty()
  readonly currentPassword: string;

  @IsNotEmpty()
  @Length(4, 128)
  @MatchesProperty('confirmPassword')
  readonly newPassword: string;

  @MatchesProperty('password')
  readonly confirmNewPassword: string;
}
