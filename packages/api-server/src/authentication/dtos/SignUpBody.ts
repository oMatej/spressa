import { Equals, IsBoolean } from 'class-validator';
import { CreateAccountBody } from '../../account/dtos';
import { Type } from 'class-transformer';

export class SignUpBody extends CreateAccountBody {
  @IsBoolean()
  @Equals(true)
  @Type(() => Boolean)
  readonly acceptTerms: boolean = false;
}
