import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { PaginationQuery } from '../commons/dtos';

import { Account } from './entities';
import { AccountService } from './AccountService';
import { ChangePasswordDto, ControllerParamsDto, CreateAccount, RemoveAccountResponse } from './dtos';

@Controller('accounts')
export class AccountController {
  private readonly logger: Logger = new Logger(AccountController.name, true);

  constructor(private readonly accountService: AccountService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAccounts(@Query() paginationQuery: PaginationQuery): Promise<Account[]> {
    return this.accountService.getAccounts(paginationQuery);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createAccount(@Body() createAccountBody: CreateAccount): Promise<Account> {
    return this.accountService.createAccount(createAccountBody);
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findAccount(@Param('id') id: string): Promise<Account> {
    return this.accountService.getAccountById(id);
  }

  @Put(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ validateCustomDecorators: true }))
  updateAccount(@Body() accountCredentialsDto: object): boolean {
    // TODO
    return true;
  }

  @Post(':id/password')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ validateCustomDecorators: true }))
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Param() { id }: ControllerParamsDto): string {
    // TODO
    return id;
  }

  @Delete(':id')
  async deleteAccount(@Param('id') id: string): Promise<RemoveAccountResponse> {
    return this.accountService.deleteAccount({ id });
  }
}
