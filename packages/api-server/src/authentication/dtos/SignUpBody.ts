import { Equals, IsBoolean } from 'class-validator';
import { CreateAccount } from '../../account/dtos';
import { Type } from 'class-transformer';

export class SignUpBody extends CreateAccount {
  @IsBoolean()
  @Equals(true)
  @Type(() => Boolean)
  readonly acceptTerms: boolean = false;
}
