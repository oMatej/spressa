import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HashingModule } from '../hashing';

import { AccountRepository } from './repositories';

import { AccountController } from './AccountController';
import { AccountService } from './AccountService';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRepository]), HashingModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
