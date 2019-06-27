import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'nestjs-config';

import { Account, AuthCode, Client, RefreshToken, Scope } from '../entities';

export const OAuthDatabaseProvider = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const oauthConfig = configService.get('database.oauth');

    return {
      ...oauthConfig,
      entities: [Account, AuthCode, Client, RefreshToken, Scope],
    };
  },
});
