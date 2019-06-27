import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from 'nestjs-config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthPayload } from '../AuthenticationService';
import { AccountService } from '../../account';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(JwtStrategy.name, true);

  constructor(private readonly accountService: AccountService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('core.APP_SECRET_KEY'),
    });
  }

  public async validate(jwtPayload: AuthPayload) {
    const { sub } = jwtPayload;

    this.logger.debug(`Validating access_token with subject ${sub}.`);

    return this.accountService.getAccountById(sub);
  }
}
