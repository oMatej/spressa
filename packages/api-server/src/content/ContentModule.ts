import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthorizationModule } from '../authorization';

import { PostRepository } from './repositories';

import { PostController } from './PostController';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostRepository]),
    PassportModule.register({ defaultStrategy: 'jwt', property: 'account' }),
    AuthorizationModule,
  ],
  controllers: [PostController],
  providers: [],
  exports: [],
})
export class ContentModule {}
