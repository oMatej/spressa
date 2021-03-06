import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';

import { DatabaseModule } from './database';
import { AccountModule } from './account';
import { AuthenticationModule } from './authentication';
import { AuthorizationModule } from './authorization';
import { ContentModule } from './content';

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    DatabaseModule,
    AccountModule,
    AuthenticationModule,
    AuthorizationModule,
    ContentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
