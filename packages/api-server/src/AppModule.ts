import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';

import { DatabaseModule, OAuthModule } from './modules';

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    DatabaseModule,
    OAuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
