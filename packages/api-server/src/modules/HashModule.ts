import { Module } from '@nestjs/common';

import { ArgonHashService } from '../services';

@Module({
  providers: [ArgonHashService],
  exports: [ArgonHashService],
})
export class HashModule {}
