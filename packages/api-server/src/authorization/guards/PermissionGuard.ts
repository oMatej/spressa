import { ExecutionContext, Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

import { Permission } from '../enums';
import { AUTHORIZED_SCOPE_KEY, PERMISSIONS_KEY } from '../decorators';

@Injectable()
export class PermissionGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector, @Optional() protected readonly options?: AuthModuleOptions) {
    super(options);
  }

  getPermissions(context) {
    return this.reflector.get<Permission[]>(PERMISSIONS_KEY, context.getHandler());
  }

  getRequest(context: ExecutionContext): any {
    return context.switchToHttp().getRequest();
  }

  public handleRequest(err, account, info, context) {
    const requiredPermissions = this.getPermissions(context);

    if (!requiredPermissions) {
      return account;
    }

    if (err || !account) {
      throw new UnauthorizedException();
    }

    const { scopes } = account;

    if (!scopes) {
      throw new UnauthorizedException();
    }

    const isAuthorized = requiredPermissions.find(permission => scopes.includes(permission));

    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    const request = this.getRequest(context);

    request[AUTHORIZED_SCOPE_KEY] = isAuthorized;

    return account;
  }
}
