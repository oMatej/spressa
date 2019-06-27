import { Module } from '@nestjs/common';

import { AuthorizationService } from './AuthorizationService';

@Module({
  imports: [],
  controllers: [],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
