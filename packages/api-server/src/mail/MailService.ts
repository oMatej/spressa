import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nest-modules/mailer';
import { ConfigService } from 'nestjs-config';
import { MyEventEmitter } from './MailEvents';
import { InjectEventEmitter } from 'nest-emitter';

@Injectable()
export class MailService {
  private readonly logger: Logger = new Logger(MailService.name, true);

  private readonly isProduction: boolean = false;
  private readonly isTesting: boolean = false;
  private readonly serviceName: string;
  private readonly serviceUrl: string;

  constructor(
    @InjectEventEmitter() private readonly emitter: MyEventEmitter,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.isProduction = this.configService.get('core.IS_PRODUCTION');
    this.isTesting = this.configService.get('mail.TESTING');
    this.serviceName = this.configService.get('core.SERVICE_NAME');
    this.serviceUrl = this.configService.get('core.SERVICE_URL');
  }

  onModuleInit() {
    this.emitter.on(
      'sendRegistrationMail',
      async (email, username, token) => await this.sendRegistrationMail(email, username, token),
    );
  }

  public async sendMail(options: ISendMailOptions) {
    this.logger.log('sendEmail: Received request to send an email message.');

    if (!this.isProduction && !this.isTesting) {
      return undefined;
    }

    return this.mailerService.sendMail(options);
  }

  public async sendRegistrationMail(email: string, username: string, token: string): Promise<void> {
    this.logger.log(`sendRegistrationMail: Handle request to send registration email to ${username}.`);

    await this.sendMail({
      to: email,
      subject: `${this.serviceName}: Activate account ${username}`,
      text: `${this.serviceUrl}/api/auth/activate/${token}`,
      html: `
          <h3>Hello, ${username}</h3>
          <p>
              You have to click on
              <strong><a href="${this.serviceUrl}/auth/activate/${token}">THIS</a></strong>
              link to activate your account.
          </p>`,
    });

    this.logger.log('sensRegistrationMail: Mail has been send successfully.');
  }
}
