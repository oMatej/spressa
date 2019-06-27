import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'nestjs-config';

import { Account } from '../account/entities';
import { Token } from '../authentication/entities';
import { Permission, Role } from '../authorization/entities';

export const TypeORMProvider = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const oauthConfig = configService.get('database.oauth');

    return {
      ...oauthConfig,
      entities: [Account, Permission, Role, Token],
    };
  },
});
