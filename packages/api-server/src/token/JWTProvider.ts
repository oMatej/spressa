import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from 'nestjs-config';

export const JWTProvider = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('core.APP_SECRET_KEY'),
    signOptions: {
      expiresIn: configService.get('auth.JWT_ACCESS_TOKEN_LIFETIME'),
      issuer: configService.get('core.SERVICE_NAME'),
    },
  }),
});
