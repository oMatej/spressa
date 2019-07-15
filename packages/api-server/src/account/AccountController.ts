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

import { PaginationQuery } from '../commons/dtos';
import { PermissionGuard } from '../authorization/guards';
import { Authorize } from '../authorization/decorators';
import { Role } from '../authorization/entities';
import { Permission } from '../authorization/enums';

import { ChangePasswordBody, CreateAccountBody, PaginationAccountResponse } from './dtos';
import { Account } from './entities';

import { AccountService } from './AccountService';

@Controller('/accounts')
@UseGuards(PermissionGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Get all accounts.
   */
  @Get('/')
  @Authorize(Permission.ADMIN, Permission.ACCOUNT_READ)
  @UsePipes(new ValidationPipe({ transform: true }))
  public async findAccounts(@Query() paginationQuery: PaginationQuery): Promise<PaginationAccountResponse> {
    // Send different responses depending on user permissions.
    // TODO: Create custom ClassSerializerInterceptor which will handle such case.
    return this.accountService.findAccountPagination(paginationQuery);
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
   */
  @Delete('/:id')
  @Authorize(Permission.ADMIN, Permission.ACCOUNT_DELETE_OWNER)
  async deleteAccount(@Param('id') id: string): Promise<void> {
    return this.accountService.deleteAccount(id);
  }

  /**
   * Change password of matching account.
   */
  @Post('/:id/password')
  @HttpCode(200)
  @Authorize(Permission.ADMIN, Permission.ACCOUNT_UPDATE_OWNER)
  @UsePipes(new ValidationPipe({ whitelist: true, validateCustomDecorators: true }))
  async changePassword(@Param('id') id: string, @Body() changePasswordBody: ChangePasswordBody): Promise<void> {
    return this.accountService.changeAccountPassword(id, changePasswordBody);
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
