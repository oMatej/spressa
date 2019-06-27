import { Module } from '@nestjs/common';

import { ArgonService } from './ArgonService';

@Module({
  providers: [ArgonService],
  exports: [ArgonService],
})
export class CryptoModule {}
