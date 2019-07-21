import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DeepPartial, DeleteResult, EntityManager, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

import { PaginationQuery } from '../commons/dtos';
import { Criteria, RepositoryFacade } from '../commons/interfaces';
import { ResponseCodes } from '../database/enums';
import { HASHING_SERVICE, HashingService } from '../hashing';
import { RoleService } from '../authorization';
import { Role } from '../authorization/entities';
import { InjectableGuardService } from '../authorization/interfaces';

import { ChangePasswordBody, CreateAccountBody, PaginationAccountResponse } from './dtos';
import { Account } from './entities';
import { AccountRepository } from './repositories';

@Injectable()
export class AccountService implements InjectableGuardService, RepositoryFacade<Account> {
  private readonly logger: Logger = new Logger(AccountService.name, true);

  constructor(
    @Inject(HASHING_SERVICE) private readonly hashingService: HashingService,
    private readonly accountRepository: AccountRepository,
    private readonly roleService: RoleService,
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
   * @param id
   */
  public async getAccountId(id: string): Promise<string> {
    return id;
  }

  /**
   * Create an instance of Account entity.
   * @param {DeepPartial<Account>} entityLike
   */
  create(entityLike: DeepPartial<Account>): Account {
    return this.accountRepository.create(entityLike);
  }

  /**
   * @param {Criteria<Account>} criteria
   * @param {EntityManager} transactionalEntityManager
   */
  public delete(criteria: Criteria<Account>, transactionalEntityManager?: EntityManager): Promise<DeleteResult> {
    if (transactionalEntityManager) {
      return transactionalEntityManager.delete(Account, criteria);
    }

    return this.accountRepository.delete(criteria);
  }

  /**
   * Find an Account[] entity(ies) by given options.
   * @param {FindManyOptions<Account>}options
   */
  public async find(options: FindManyOptions<Account>): Promise<Account[]> {
    return this.accountRepository.find(options);
  }

  /**
   * Find an account that fulfills search criteria.
   * @param {FindOneOptions<Account>} options
   */
  public async findOne(options: FindOneOptions<Account>): Promise<Account> {
    this.logger.log(`findOne: Retrieving account. Options: ${JSON.stringify(options)}.`);

    try {
      const account: Account = await this.accountRepository.findOneOrFail(options);

      this.logger.log(`findOne: Found account "${account.id}".`);

      return account;
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        this.logger.log(`findOne: Account ${JSON.stringify(options)} does not exist.`);

        throw new NotFoundException();
      }

      throw e;
    }
  }

  /**
   * Find account by id.
   * @param {String} id
   * @param {FindOneOptions<Account>} [options]
   */
  public async findOneById(id: string, options?: FindOneOptions<Account>): Promise<Account> {
    return this.findOne({ where: { id }, ...options });
  }

  /**
   * Store an instance of Account in database.
   * @param {Account} account
   * @param {EntityManager} transactionalEntityManager
   */
  public async save(account: Account, transactionalEntityManager?: EntityManager): Promise<Account> {
    this.logger.log(`save: Save an instance of ${account.username} in database.`);

    try {
      if (transactionalEntityManager) {
        return await transactionalEntityManager.save(account);
      }

      return await this.accountRepository.save(account);
    } catch (e) {
      this.logger.error(`${e.code}: Could not fulfill the request to create an account ${account.email}.`);

      if (e.code === ResponseCodes.ER_DUP_ENTRY) {
        throw new ConflictException();
      }

      throw new InternalServerErrorException();
    }
  }

  /**
   * Update record in database by id.
   * @param {Criteria<Account>} criteria
   * @param {DeepPartial<Account>} partialEntity
   * @param transactionalEntityManager
   */
  public async update(
    criteria: Criteria<Account>,
    partialEntity: DeepPartial<Account>,
    transactionalEntityManager?: EntityManager,
  ): Promise<UpdateResult> {
    this.logger.log(`update: Update account "${criteria}".`);

    if (transactionalEntityManager) {
      return transactionalEntityManager.update(Account, criteria, partialEntity);
    }

    return this.accountRepository.update(criteria, partialEntity);
  }

  /**
   * Update account password.
   * @param {String} id
   * @param {ChangePasswordBody} changePasswordBody
   */
  public async changeAccountPassword(id: string, changePasswordBody: ChangePasswordBody): Promise<void> {
    this.logger.log(`changePassword: Attempted to change password of account "${id}".`);

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
   * @param {EntityManager} transactionalEntityManager
   */
  public async createAccount(
    createAccountBody: CreateAccountBody,
    transactionalEntityManager?: EntityManager,
  ): Promise<Account> {
    const { email, username, password } = createAccountBody;

    this.logger.log(`createAccount: Attempted to create an account "${email}".`);

    const roles: Role[] = await this.roleService.findDefaultRoles();
    const hash: string = await this.hash(password);

    const account: Account = this.create({ email, username, password: hash, roles });

    await this.save(account, transactionalEntityManager);

    this.logger.log(`createAccount: Successfully created account "${email}".`);

    return account;
  }

  /**
   * Delete account by id.
   * @param {String} id
   */
  public async deleteAccount(id: string): Promise<void> {
    this.logger.log(`deleteAccount: Attempted to delete account "${id}".`);

    await this.delete(id);

    this.logger.log(`deleteAccount: Successfully deleted account "${id}".`);
  }

  /**
   * Get list of accounts for specific filter parameters.
   * @param {PaginationQuery} paginationQuery
   */
  public async findAccountPagination(paginationQuery: PaginationQuery): Promise<PaginationAccountResponse> {
    const { limit, order, page } = paginationQuery;

    this.logger.log(`findAccountPagination: Retrieving list of accounts. Query: ${JSON.stringify(paginationQuery)}.`);

    const skip: number = page * limit - limit;

    const [items, total] = await this.accountRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: order },
    });

    const pages = total / limit > 1 ? Math.ceil(total / limit) : 1;

    this.logger.log(`fondAccountPagination: Fulfilled request. Total amount of accounts: ${total}.`);

    return new PaginationAccountResponse({
      page,
      pages,
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
   * @param {String} id
   * @param {String} roleId
   */
  public async toggleRoleRelation(id: string, roleId: string): Promise<void> {
    this.logger.log(`toggleRoleRelation: Toggle relation between account "${id}" and role "${roleId}".`);

    const account: Account = await this.findOne({ where: { id }, relations: ['roles'] });

    const { roles } = account;

    const match = roles.find(role => role.id === roleId);

    if (match) {
      this.logger.log(`toggleRoleRelation: Detach relation between account "${id}" and role "${roleId}".`);

      account.roles = account.roles.filter(role => role.id !== roleId);
    } else {
      const role = await this.roleService.findOneById(roleId);

      this.logger.log(`toggleRoleRelation: Attach relation between account "${id}" and role "${roleId}".`);

      account.roles = account.roles.concat(role);
    }

    await this.save(account);
  }
}
