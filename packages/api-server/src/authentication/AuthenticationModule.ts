import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from 'nestjs-config';

import { AccountModule } from '../account';
import { GUARD_SERVICE } from '../authorization';
import { EncryptionModule } from '../encryption';
import { HashingModule } from '../hashing';
import { MailModule } from '../mail';
import { TokenModule } from '../token';

import { JwtStrategy } from './strategies';

import { AuthenticationController } from './AuthenticationController';
import { AuthenticationService } from './AuthenticationService';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', property: 'account' }),
    ConfigModule,
    EncryptionModule,
    TokenModule,
    HashingModule,
    AccountModule,
    MailModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    JwtStrategy,
    {
      provide: GUARD_SERVICE,
      useClass: AuthenticationService,
    },
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
