import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';

import { PaginationQuery } from '../commons/dtos';
import { ResponseCodes } from '../database/enums';
import { HashingService } from '../hashing';
import { RoleService } from '../authorization';
import { Role } from '../authorization/entities';
import { Permission } from '../authorization/enums';

import { ChangePasswordBody, CreateAccountBody } from './dtos';
import { Account } from './entities';
import { AccountRepository } from './repositories';
import { PaginationAccountResponse } from './dtos/PaginationAccountResponse';

class OptionalAuthObject {
  readonly accountId?: string;
  readonly scope?: Permission;
}

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name, true);

  constructor(
    @Inject('HashingService') private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly accountRepository: AccountRepository,
  ) {}

  /**
   * @param {String} password
   */
  private async hash(password: string): Promise<string> {
    return this.hashingService.hash(password);
  }

  /**
   * @param {String} hash
   * @param {String} password
   */
  private async verify(hash: string, password: string): Promise<boolean> {
    return this.hashingService.verify(hash, password);
  }

  /**
   * @param {Account} account
   */
  private async save(account: Account) {
    try {
      await this.accountRepository.save(account);
    } catch (e) {
      this.logger.error(`${e.code}: Could not fulfill the request to create an account ${account.email}.`);

      if (e.code === ResponseCodes.ER_DUP_ENTRY) {
        throw new ConflictException();
      }

      throw new InternalServerErrorException();
    }
  }

  /**
   * @param {String} id
   * @param {ChangePasswordBody} changePasswordBody
   * @param {OptionalAuthObject} optionalAuthObject
   */
  public async changePassword(
    id: string,
    changePasswordBody: ChangePasswordBody,
    optionalAuthObject: OptionalAuthObject = {},
  ): Promise<void> {
    this.logger.log(`changePassword: Attempted to change password of account "${id}".`);

    this.filterUnauthorizedAttempts(id, [Permission.ACCOUNT_UPDATE_OWNER], optionalAuthObject);

    const { currentPassword, newPassword } = changePasswordBody;

    const account: Account = await this.findOneById(id);

    const isCurrentPasswordCorrect: boolean = await this.verify(account.password, currentPassword);

    if (!isCurrentPasswordCorrect) {
      throw new UnauthorizedException();
    }

    account.password = await this.hash(newPassword);

    this.logger.log(`changePassword: Successfully changed password of "${id}" account.`);

    await this.save(account);
  }

  /**
   * Create new account with unique username and email address.
   * Attach default roles to each newly created account.
   * @param {CreateAccountBody} createAccountBody
   */
  public async createAccount(createAccountBody: CreateAccountBody): Promise<Account> {
    const { email, username, password } = createAccountBody;

    this.logger.log(`createAccount: Attempted to create an account "${email}".`);

    const roles: Role[] = await this.roleService.getDefault();
    const hash: string = await this.hash(password);

    const account: Account = await this.accountRepository.create({
      email,
      username,
      password: hash,
      roles,
    });

    await this.save(account);

    delete account.roles;

    this.logger.log(`createAccount: Successfully created account "${email}".`);

    return account;
  }

  /**
   * Delete account by where query.
   * @param {String} id
   * @param {OptionalAuthObject} [optionalAuthObject]
   */
  public async deleteAccount(id: string, optionalAuthObject: OptionalAuthObject): Promise<void> {
    this.logger.log(`deleteAccount: Attempted to delete account "${id}".`);

    this.filterUnauthorizedAttempts(id, [Permission.ACCOUNT_DELETE_OWNER], optionalAuthObject);

    await this.accountRepository.delete({ id });

    this.logger.log(`deleteAccount: Successfully deleted account "${id}".`);
  }

  /**
   * TODO: Find a way to move to to guard / decorator.
   * @param {String} id
   * @param {Permission[]} filter
   * @param {OptionalAuthObject} optionalAuthObject
   */
  private filterUnauthorizedAttempts(id: string, filter: Permission[], optionalAuthObject: OptionalAuthObject = {}) {
    const { scope, accountId } = optionalAuthObject;

    if (filter.includes(scope) && id !== accountId) {
      this.logger.warn(`Account "${accountId}" attempted to perform an action on "${id}" with scope "${scope}".`);
      throw new UnauthorizedException();
    }
  }

  /**
   * @param options
   */
  public async find(options: FindManyOptions): Promise<Account[]> {
    return this.accountRepository.find(options);
  }

  /**
   * Get list of accounts for specific filter parameters.
   * @param {PaginationQuery} paginationQuery
   */
  public async findAccountPagination(paginationQuery: PaginationQuery): Promise<PaginationAccountResponse> {
    const { limit, order, page } = paginationQuery;

    this.logger.log(`findAccountPagination: Retrieving list of accounts. Query: ${JSON.stringify(paginationQuery)}.`);

    const skip: number = page * limit - limit;

    const total = await this.accountRepository.count();
    const items = await this.find({ skip, take: limit, order: { createdAt: order } });

    this.logger.log(`fondAccountPagination: Fulfilled request. Total amount of accounts: ${total}.`);

    return new PaginationAccountResponse({
      page: skip + 1,
      limit,
      total,
      items,
    });
  }

  /**
   * @param id
   */
  public async findAccountRoles(id: string): Promise<Role[]> {
    this.logger.log(`findAccountRoles: Find roles of account ${id}.`);

    const account = await this.findOne({ where: { id }, relations: ['roles'] });

    this.logger.log(`findAccountRoles: Fulfilled request.`);

    return account.roles;
  }

  /**
   * Find an account that fulfills search criteria.
   * @param {FindOneOptions} options
   */
  public async findOne(options: FindOneOptions): Promise<Account> {
    this.logger.log(`findOne: Retrieving account. Options: ${JSON.stringify(options)}.`);

    const account: Account = await this.accountRepository.findOne(options);

    if (!account) {
      this.logger.log(`findOne: Account ${JSON.stringify(options)} does not exist.`);

      throw new NotFoundException();
    }

    this.logger.log(`findOne: Found account "${account.id}".`);

    return account;
  }

  /**
   * Find account by id.
   * @param {String} id
   */
  public async findOneById(id: string): Promise<Account> {
    return this.findOne({ where: { id } });
  }

  /**
   * @param {String} id
   * @param {String} roleId
   */
  public async toggleRoleRelation(id: string, roleId: string): Promise<void> {
    this.logger.log(`toggleRoleRelation: Toggle relation between account "${id}" and role "${roleId}".`);

    const account = await this.findOne({ where: { id }, relations: ['roles'] });

    const { roles } = account;

    const match = roles.find(role => role.id === roleId);

    if (match) {
      this.logger.log(`toggleRoleRelation: Detach relation between account "${id}" and role "${roleId}".`);

      account.roles = account.roles.filter(role => role.id !== roleId);
    } else {
      const role = await this.roleService.findById(roleId);

      this.logger.log(`toggleRoleRelation: Attach relation between account "${id}" and role "${roleId}".`);

      account.roles = account.roles.concat(role);
    }

    await this.save(account);
  }

  public async update(account: Account) {
    this.logger.log(`update: Update account "${account.id}".`);

    return this.accountRepository.update(account.id, account);
  }
}
