import { Module } from '@nestjs/common';
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';

// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'ronny77@ethereal.email',
//         pass: 'nKRxhm6d8CYXURE89x'
//     }
// });

const mailerProvider = MailerModule.forRoot({
  transport: {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ronny77@ethereal.email',
      pass: 'nKRxhm6d8CYXURE89x',
    },
  },
  defaults: {
    from: 'TEST',
  },
  template: {
    dir: __dirname + '/templates',
    adapter: new HandlebarsAdapter(), // or new PugAdapter()
    options: {
      strict: true,
    },
  },
});

@Module({
  imports: [mailerProvider],
  exports: [mailerProvider],
})
export class MailModule {}
