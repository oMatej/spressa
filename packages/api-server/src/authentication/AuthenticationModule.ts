import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from 'nestjs-config';

import { AccountModule } from '../account';
import { EncryptionModule } from '../encryption';
import { HashingModule } from '../hashing';
import { TokenModule } from '../token';

import { TokenRepository } from './repositories';
import { JwtStrategy } from './strategies';

import { AuthenticationController } from './AuthenticationController';
import { AuthenticationService } from './AuthenticationService';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenRepository]),
    PassportModule.register({ defaultStrategy: 'jwt', property: 'account' }),
    ConfigModule,
    EncryptionModule,
    TokenModule,
    HashingModule,
    AccountModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, JwtStrategy],
  exports: [AuthenticationService, PassportModule],
})
export class AuthenticationModule {}
