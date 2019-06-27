import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OAuthController } from './OAuthController';
import { OAuthService } from './OAuthService';

import { Client, Account, RefreshToken, Scope, AuthCode } from './entities';

import { TokenModule } from '../token';
import { CryptoModule } from '../crypto';

@Module({
  imports: [TokenModule, TypeOrmModule.forFeature([Account, AuthCode, Client, RefreshToken, Scope]), CryptoModule],
  controllers: [OAuthController],
  providers: [OAuthService],
})
export class OAuthModule {}
