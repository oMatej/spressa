import { Module } from '@nestjs/common';

import { JWTProvider } from '../providers';

@Module({
  imports: [JWTProvider],
  exports: [JWTProvider],
})
export class JWTModule {}
