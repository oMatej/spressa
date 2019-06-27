import { IsAlphanumeric, IsNotEmpty, Length } from 'class-validator';

export class AccountCredentialsDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @Length(4, 128)
  readonly password: string;
}
