import { MailerModule } from '@nest-modules/mailer';
import { ConfigModule, ConfigService } from 'nestjs-config';

export const MailProvider = MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get('mail');

    return {
      transport: config.transport,
      defaults: config.defaults,
    };
  },
});
