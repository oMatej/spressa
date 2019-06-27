import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';

import { DatabaseModule } from './database';
import { OAuthModule } from './oauth';

@Module({
  imports: [ConfigModule.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')), DatabaseModule, OAuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
