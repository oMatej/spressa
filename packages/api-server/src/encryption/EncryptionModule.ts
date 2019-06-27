import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';

import { EncryptionProvider } from './EncryptionProvider';

@Module({
  imports: [ConfigModule],
  providers: [EncryptionProvider],
  exports: [EncryptionProvider],
})
export class EncryptionModule {}
