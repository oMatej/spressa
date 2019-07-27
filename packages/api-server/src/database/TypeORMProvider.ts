import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'nestjs-config';

import { Account } from '../account/entities';
import { Role } from '../authorization/entities';
import { Comment, Metadata, Page, Post } from '../content/entities';
import { Token } from '../token/entities';

export const TypeORMProvider = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get('database');

    return {
      ...config,
      entities: [Account, Comment, Metadata, Page, Post, Role, Token],
    };
  },
});
