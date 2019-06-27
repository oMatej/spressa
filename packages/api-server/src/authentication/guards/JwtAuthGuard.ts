import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // TODO: Move to authorization module.
  // canActivate(context: ExecutionContext, ...props) {
  //   console.log({ context, ...props });
  //
  //   return super.canActivate(context);
  // }

  public handleRequest(err, user) {
    if (err || !user) {
      // Throw unauthorized exception in case of any error or missing account.
      throw new UnauthorizedException();
    }

    return user;
  }
}
