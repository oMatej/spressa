import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Account } from '../account/entities';

import { IP } from './decorators';
import { ResendEmailBody, SignInBody, SignUpBody } from './dtos';
import { AuthResponse, AuthenticationService } from './AuthenticationService';

@Controller('/auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/login')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signIn(@Body() signInBody: SignInBody, @IP() ip: string): Promise<AuthResponse> {
    const { email, password } = signInBody;
    return this.authenticationService.attempt(email, password, ip);
  }

  @Post('/register')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true, validateCustomDecorators: true }))
  async signUp(@Body() signUpBody: SignUpBody, @IP() ip: string): Promise<Account> {
    return this.authenticationService.register(signUpBody, ip);
  }

  @Post('/activate/resend')
  async resendActivationMail(@Body() resendEmailBody: ResendEmailBody, @IP() ip: string) {
    const { email } = resendEmailBody;
    return this.authenticationService.sendActivationMail(email, ip);
  }

  @Get('/activate/:token')
  async activate(@Param('token') token: string) {
    return this.authenticationService.activate(token);
  }
}
