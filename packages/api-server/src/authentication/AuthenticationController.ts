import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

import { Cookies } from '../commons/decorators';
import { Account } from '../account/entities';
import { AccountService } from '../account';

import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { AuthResponse, AuthenticationService } from './AuthenticationService';
import { SignInBody, SignUpBody } from './dtos';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Get('check_token')
  @UseGuards(JwtAuthGuard)
  async checkToken(@Headers('authorization') bearerToken: string, @Cookies() cookies: object): Promise<any> {
    return await this.authenticationService.check(
      bearerToken || cookies[this.configService.get('core.COOKIE_TOKEN_KEY')],
    );
  }

  @Post('signin')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signIn(@Body() signInBody: SignInBody): Promise<AuthResponse> {
    const { email, password } = signInBody;
    return this.authenticationService.attempt(email, password);
  }

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true, validateCustomDecorators: true }))
  async signUp(@Body() signUpBody: SignUpBody): Promise<Account> {
    return this.accountService.createAccount(signUpBody);
  }
}
