import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Account } from '../account/entities';
import { PermissionGuard } from '../authorization/guards';
import { IP } from '../commons/decorators';

import { BearerToken } from './decorators';
import { ResendEmailBody, SignInBody, SignUpBody } from './dtos';
import { AuthResponse, AuthenticationService } from './AuthenticationService';
import { TokenService } from '../token';

@Controller('/auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('/register')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true, validateCustomDecorators: true }))
  async signUp(@Body() signUpBody: SignUpBody, @IP() ip: string): Promise<Account> {
    return this.authenticationService.register(signUpBody, ip);
  }

  @Post('/token')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signIn(@Body() signInBody: SignInBody, @IP() ip: string): Promise<AuthResponse> {
    const { email, password } = signInBody;
    return this.authenticationService.attempt(email, password, ip);
  }

  @Post('/refresh_token')
  async test(@Body('refreshToken') refreshToken: string, @IP() ip: string) {
    return this.authenticationService.generateForRefreshToken(refreshToken, ip);
  }

  @Get('/me')
  @UseGuards(PermissionGuard)
  async checkToken(@BearerToken() token: string): Promise<any> {
    return await this.tokenService.decode(token);
  }

  @Post('/activate/resend')
  async resendActivationMail(@Body() resendEmailBody: ResendEmailBody, @IP() ip: string) {
    const { email } = resendEmailBody;
    return this.authenticationService.sendActivationMail(email, ip);
  }

  @Get('/activate/:token')
  @UseInterceptors(ClassSerializerInterceptor)
  async activate(@Param('token') token: string) {
    return this.authenticationService.activate(token);
  }
}
