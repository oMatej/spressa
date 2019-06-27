import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'nestjs-config';

import { RoleRepository } from './repositories';
import { RoleService } from './RoleService';
import { RoleController } from './RoleController';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRepository]), ConfigModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class AuthorizationModule {}
