import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { classToPlain } from 'class-transformer';

import { PaginationQuery } from '../commons/dtos';
import { PermissionGuard } from '../authorization/guards';
import { Authorize, AuthorizedScope } from '../authorization/decorators';
import { Role } from '../authorization/entities';
import { Permission } from '../authorization/enums';

import { Account as GetAccount } from './decorators';
import { ChangePasswordBody, CreateAccountBody } from './dtos';
import { Account } from './entities';

import { AccountService } from './AccountService';

@Controller('/accounts')
@UseGuards(PermissionGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Get all accounts.
   * TODO: Finish pagination.
   */
  @Get('/')
  @Authorize(Permission.ADMIN, Permission.ACCOUNT_READ)
  @UsePipes(new ValidationPipe({ transform: true }))
  public async findAccounts(
    @Query() paginationQuery: PaginationQuery,
    @AuthorizedScope() scope: Permission,
  ): Promise<object> {
    const response = await this.accountService.findAccountPagination(paginationQuery);

    // Send different responses depending on user permissions.
    // TODO: Create custom ClassSerializerInterceptor which will handle such case.
    return classToPlain(response, { groups: [scope] });
  }

  /**
   * Create an account.
   */
  @Post('/')
  @Authorize(Permission.ADMIN)
  @SerializeOptions({
    groups: [Permission.ADMIN],
  })
  @UsePipes(new ValidationPipe({ whitelist: true, validateCustomDecorators: true }))
  async createAccount(@Body() createAccountBody: CreateAccountBody): Promise<Account> {
    return this.accountService.createAccount(createAccountBody);
  }

  /**
   * Get matching account.
   */
  @Get('/:id')
  @Authorize(Permission.ADMIN, Permission.ACCOUNT_READ)
  async findAccount(@Param('id') id: string): Promise<Account> {
    return this.accountService.findOneById(id);
  }

  /**
   * Delete a matching account.
   * TODO: Finish authorization. Stop the request before the controller if account without ADMIN permission attempts to remove someone else's account.
   */
  @Delete('/:id')
  @Authorize(Permission.ADMIN, Permission.ACCOUNT_DELETE, Permission.ACCOUNT_DELETE_OWNER)
  async deleteAccount(
    @Param('id') id: string,
    @GetAccount('id') accountId: string,
    @AuthorizedScope() scope: Permission,
  ): Promise<void> {
    return this.accountService.deleteAccount(id, { accountId, scope });
  }

  /**
   * Change password of matching account.
   * TODO: Finish authorization. Stop the request before the controller if account without ADMIN permission attempts to remove someone else's account.
   */
  @Post('/:id/password')
  @HttpCode(200)
  @Authorize(Permission.ADMIN, Permission.ACCOUNT_UPDATE, Permission.ACCOUNT_UPDATE_OWNER)
  @UsePipes(new ValidationPipe({ whitelist: true, validateCustomDecorators: true }))
  async changePassword(
    @Param('id') id: string,
    @GetAccount('id') accountId: string,
    @AuthorizedScope() scope: Permission,
    @Body() changePasswordBody: ChangePasswordBody,
  ): Promise<void> {
    return this.accountService.changePassword(id, changePasswordBody, { accountId, scope });
  }

  /**
   * Get roles of matching account.
   */
  @Get('/:id/roles')
  @Authorize(Permission.ADMIN)
  async findRolesByAccountId(@Param('id') id: string): Promise<Role[]> {
    return this.accountService.findAccountRoles(id);
  }

  /**
   * Toggle role of matching account.
   */
  @Patch('/:id/roles/:roleId')
  @Authorize(Permission.ADMIN)
  async toggleRoleForAccount(@Param('id') id: string, @Param('roleId') roleId: string): Promise<void> {
    return this.accountService.toggleRoleRelation(id, roleId);
  }
}
