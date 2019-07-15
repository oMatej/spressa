import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from 'nestjs-config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthPayload } from '../AuthenticationService';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(JwtStrategy.name, true);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('core.APP_SECRET_KEY'),
    });
  }

  public async validate(jwtPayload: AuthPayload) {
    const { email, scopes, sub: id } = jwtPayload;

    this.logger.debug(`*** JWTStrategy ***`);
    this.logger.debug(JSON.stringify(jwtPayload));
    this.logger.debug(`*** JWTStrategy ***`);

    return { email, id, scopes };
  }
}
