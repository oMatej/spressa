import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OAuthController } from '../controllers';
import { ArgonHashService, OAuthService } from '../services';
import { Client, Account, RefreshToken, Scope, AuthCode } from '../entities';

import { JWTModule } from './JWTModule';
import { HashModule } from './HashModule';

@Module({
  imports: [
    HashModule,
    JWTModule,
    TypeOrmModule.forFeature([Account, AuthCode, Client, RefreshToken, Scope]),
  ],
  controllers: [OAuthController],
  providers: [OAuthService],
})
export class OAuthModule {}
