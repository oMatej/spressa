import { Module } from '@nestjs/common';

import { JWTProvider } from './JWTProvider';

@Module({
  imports: [JWTProvider],
  exports: [JWTProvider],
})
export class TokenModule {}
