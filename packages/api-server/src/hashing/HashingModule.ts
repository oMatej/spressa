import { Module } from '@nestjs/common';

import { HashingProvider } from './HashingProvider';

@Module({
  providers: [HashingProvider],
  exports: [HashingProvider],
})
export class HashingModule {}
