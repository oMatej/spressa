import { Module } from '@nestjs/common';

import { TypeORMProvider } from './TypeORMProvider';

@Module({
  imports: [TypeORMProvider],
  exports: [TypeORMProvider],
})
export class DatabaseModule {}
