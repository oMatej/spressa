import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

import { Account as GetAccount } from '../account/decorators';
import { PermissionGuard } from '../authorization/guards';

import { BearerToken, IP } from './decorators';
import { RevokeTokenResponse } from './dtos';
import { Token } from './entities';
import { AuthenticationService } from './AuthenticationService';

@Controller('/tokens')
export class TokenController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Get('/')
  @UseGuards(PermissionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getTokens(@GetAccount('id') id: string): Promise<Token[]> {
    return this.authenticationService.getTokens(id);
  }

  @Get('/check')
  @UseGuards(PermissionGuard)
  async checkToken(@BearerToken() token: string): Promise<any> {
    return await this.authenticationService.check(token);
  }

  @Post('/refresh')
  async test(@Body('refreshToken') refreshToken: string, @IP() ip: string) {
    return this.authenticationService.generateForRefreshToken(refreshToken, ip);
  }

  @Delete('/:id')
  @UseGuards(PermissionGuard)
  async revokeToken(@GetAccount('id') accountId: string, @Param('id') id: string): Promise<RevokeTokenResponse> {
    return this.authenticationService.revokeToken(accountId, id);
  }
}
