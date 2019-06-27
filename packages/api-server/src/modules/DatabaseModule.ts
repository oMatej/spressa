import { Module } from '@nestjs/common';

import { OAuthDatabaseProvider } from '../providers';

@Module({
  imports: [OAuthDatabaseProvider],
  exports: [OAuthDatabaseProvider],
})
export class DatabaseModule {}
