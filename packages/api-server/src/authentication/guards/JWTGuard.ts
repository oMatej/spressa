import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTGuard extends AuthGuard('jwt') {
  public handleRequest(err, account) {
    if (err || !account) {
      // Throw unauthorized exception in case of any error or missing account.
      throw new UnauthorizedException();
    }

    return account;
  }
}
