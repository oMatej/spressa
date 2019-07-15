import { ExecutionContext, Inject, Injectable, Logger, Optional, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';
import { Request } from 'express';

import { Permission } from '../enums';
import { PERMISSIONS_KEY } from '../decorators';

export const GUARD_SERVICE = 'GuardService';

@Injectable()
export class PermissionGuard extends AuthGuard('jwt') {
  private readonly logger: Logger = new Logger(PermissionGuard.name, true);

  constructor(
    private readonly reflector: Reflector,
    @Inject(GUARD_SERVICE) private readonly guardService,
    @Optional() protected readonly options?: AuthModuleOptions,
  ) {
    super(options);
  }

  getPermissions(context: ExecutionContext): Permission[] {
    return this.reflector.get<Permission[]>(PERMISSIONS_KEY, context.getHandler());
  }

  getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }

  private async validateOwner(accountId: string, resourceId: string, permission: Permission): Promise<boolean> {
    this.logger.log(
      `Account "${accountId}" with permission "${permission}" attempted to perform an action on resource "${resourceId}".`,
    );

    if (permission.endsWith('_OWNER')) {
      const ownerId = await this.guardService.getAccountId(resourceId);

      this.logger.log(
        `Account "${accountId} attempted to perform an action on resource "${resourceId}" owned by "${ownerId}".`,
      );

      return accountId === ownerId;
    }

    return true;
  }

  // @ts-ignore
  public async handleRequest(err: any, account: any, info: any, context: any) {
    if (err || !account) {
      throw new UnauthorizedException();
    }

    const requiredPermissions = this.getPermissions(context);

    if (!requiredPermissions) {
      return account;
    }

    const { scopes } = account;

    if (!scopes) {
      this.logger.log(`Account "${account.id} does not have any scope.`);
      throw new UnauthorizedException();
    }

    const authorizedScope = requiredPermissions.find(permission => scopes.includes(permission));

    if (!authorizedScope) {
      this.logger.log(`Account "${account.id}" does not have necessary scope to access endpoint.`);
      throw new UnauthorizedException();
    }

    const request: Request = this.getRequest(context);

    const { id } = request.params;

    const isValidated: boolean = await this.validateOwner(account.id, id, authorizedScope);

    if (!isValidated) {
      throw new UnauthorizedException();
    }

    return account;
  }
}
