import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'nestjs-config';

import { GUARD_SERVICE } from './guards';
import { RoleRepository } from './repositories';

import { RoleController } from './RoleController';
import { RoleService } from './RoleService';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRepository]), ConfigModule],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: GUARD_SERVICE,
      useClass: RoleService,
    },
  ],
  exports: [RoleService],
})
export class AuthorizationModule {}
