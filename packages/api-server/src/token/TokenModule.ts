import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'nestjs-config';

import { AccountModule } from '../account';
import { GUARD_SERVICE } from '../authorization/guards';
import { EncryptionModule } from '../encryption';
import { HashingModule } from '../hashing';

import { TokenRepository } from './repositories';

import { JWTProvider } from './JWTProvider';
import { TokenController } from './TokenController';
import { TokenService } from './TokenService';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenRepository]),
    PassportModule.register({ defaultStrategy: 'jwt', property: 'account' }),
    AccountModule,
    ConfigModule,
    EncryptionModule,
    HashingModule,
    JWTProvider,
  ],
  controllers: [TokenController],
  providers: [
    {
      provide: GUARD_SERVICE,
      useClass: TokenService,
    },
    TokenService,
  ],
  exports: [JWTProvider, TokenService],
})
export class TokenModule {}
