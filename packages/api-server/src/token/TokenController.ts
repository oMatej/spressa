import { ClassSerializerInterceptor, Controller, Delete, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

import { Account as GetAccount } from '../account/decorators';
import { Authorize } from '../authorization/decorators';
import { Permission } from '../authorization/enums';
import { PermissionGuard } from '../authorization/guards';

import { RevokeTokenResponse } from './dtos';
import { Token } from './entities';

import { TokenService } from './TokenService';

@Controller('/tokens')
@UseGuards(PermissionGuard)
export class TokenController {
  constructor(private readonly configService: ConfigService, private readonly tokenService: TokenService) {}

  @Get('/')
  @UseInterceptors(ClassSerializerInterceptor)
  async getTokens(@GetAccount('id') id: string): Promise<Token[]> {
    return this.tokenService.getTokens(id);
  }

  @Delete('/:id')
  @Authorize(Permission.ADMIN, Permission.TOKEN_DELETE_OWNER)
  async revokeToken(@GetAccount('id') accountId: string, @Param('id') id: string): Promise<RevokeTokenResponse> {
    return this.tokenService.revokeToken(accountId, id);
  }
}
