import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { NestEmitterModule } from 'nest-emitter';
import { EventEmitter } from 'events';

import { MailProvider } from './MailProvider';
import { MailService } from './MailService';

@Module({
  imports: [ConfigModule, MailProvider, NestEmitterModule.forRoot(new EventEmitter())],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
