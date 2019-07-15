import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { HashingModule } from '../hashing';
import { AuthorizationModule, GUARD_SERVICE } from '../authorization';

import { AccountRepository } from './repositories';

import { AccountController } from './AccountController';
import { AccountService } from './AccountService';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountRepository]),
    PassportModule.register({ defaultStrategy: 'jwt', property: 'account' }),
    AuthorizationModule,
    HashingModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    {
      provide: GUARD_SERVICE,
      useClass: AccountService,
    },
  ],
  exports: [AccountService],
})
export class AccountModule {}
