import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { HashingModule } from '../hashing';
import { AuthorizationModule } from '../authorization';

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
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
