import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PaginationQuery } from '../commons/dtos';
import { ResponseCodes } from '../database/enums';
import { HashingService } from '../hashing';

import { CreateAccount, RemoveAccountResponse } from './dtos';
import { Account } from './entities';
import { AccountRepository } from './repositories';

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name, true);

  constructor(
    @Inject('HashingService') private readonly hashingService: HashingService,
    private readonly accountRepository: AccountRepository,
  ) {}

  /**
   * Create new account with unique username and email address.
   * @param {CreateAccount} createAccountBody
   */
  public async createAccount(createAccountBody: CreateAccount): Promise<Account> {
    const { email, username, password } = createAccountBody;

    this.logger.log(`Creating an account ${email}.`);

    const account: Account = await this.accountRepository.create({
      email,
      username,
      password: await this.hashingService.hash(password),
    });

    try {
      await this.accountRepository.save(account);
    } catch (e) {
      this.logger.error(`${e.code}: Could not fulfill the request to create an account ${email}.`);

      if (e.code === ResponseCodes.ER_DUP_ENTRY) {
        throw new ConflictException();
      }

      throw new InternalServerErrorException();
    }

    this.logger.log(`Account ${email} created successfully.`);

    return account;
  }

  /**
   * Get list of accounts for specific filter parameters.
   * @param {PaginationQuery} paginationQuery
   */
  public async getAccounts(paginationQuery: PaginationQuery): Promise<Account[]> {
    const { limit, order, page } = paginationQuery;

    this.logger.log(`Requested list of accounts.`);

    const skip: number = page * limit - limit;

    return this.accountRepository.find({
      // @ts-ignore
      skip,
      take: limit,
      order: {
        createdAt: order,
      },
    });
  }

  /**
   * Find an account that fulfills search criteria.
   * @param {Object} where
   */
  public async getAccount(where: object): Promise<Account> {
    const account: Account = await this.accountRepository.findOne({ where });

    if (!account) {
      throw new NotFoundException();
    }

    return account;
  }

  /**
   * Find account by id.
   * @param {String} id
   */
  public async getAccountById(id: string): Promise<Account> {
    const account: Account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      throw new NotFoundException();
    }

    return account;
  }

  public async deleteAccount(where: object): Promise<RemoveAccountResponse> {
    const account = await this.getAccount(where);

    await this.accountRepository.delete({ id: account.id });

    return { id: account.id };
  }
}
