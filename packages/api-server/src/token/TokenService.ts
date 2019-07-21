import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'nestjs-config';
import { DeepPartial, EntityManager, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import * as nanoId from 'nanoid';

import { AccountService } from '../account';
import { InjectableGuardService } from '../authorization/interfaces';
import { Criteria, RepositoryFacade } from '../commons/interfaces';
import { ENCRYPTION_SERVICE, EncryptionService } from '../encryption';
import { HASHING_SERVICE, HashingService } from '../hashing';

import { TokenRepository } from './repositories';
import { Account } from '../account/entities';
import { Token } from './entities';
import { TokenTypes } from './enums';
import { ResponseCodes } from '../database/enums';
import { RevokeTokenResponse } from './dtos';

export interface RandomToken {
  readonly token: string;
  readonly expiresAt: Date;
}

@Injectable()
export class TokenService implements InjectableGuardService, RepositoryFacade<Token> {
  static readonly prefix: string = 'Bearer';

  private readonly logger: Logger = new Logger(TokenService.name, true);
  private readonly isProduction: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    @Inject(ENCRYPTION_SERVICE) private readonly encryptionService: EncryptionService,
    @Inject(HASHING_SERVICE) private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly tokenRepository: TokenRepository,
    private readonly accountService: AccountService,
  ) {
    this.isProduction = this.configService.get('core.IS_PRODUCTION');
  }

  /**
   * @param token
   */
  public create(token: DeepPartial<Token>): Token {
    return this.tokenRepository.create(token);
  }

  /**
   * @param criteria
   * @param transactionalEntityManager
   */
  public async delete(criteria: Criteria<Token>, transactionalEntityManager?: EntityManager) {
    if (transactionalEntityManager) {
      return transactionalEntityManager.delete(Token, criteria);
    }

    return this.tokenRepository.delete(criteria);
  }

  /**
   * Find an Account[] entity(ies) by given options.
   * @param {FindManyOptions<Account>}options
   */
  public async find(options: FindManyOptions<Token>): Promise<Token[]> {
    return this.tokenRepository.find(options);
  }

  /**
   * Find an account that fulfills search criteria.
   * @param {FindOneOptions<Account>} options
   */
  public async findOne(options: FindOneOptions<Token>): Promise<Token> {
    this.logger.log(`findOne: Retrieving token. Options: ${JSON.stringify(options)}.`);

    try {
      const token: Token = await this.tokenRepository.findOneOrFail(options);

      this.logger.log(`findOne: Found token "${token.id}".`);

      return token;
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        this.logger.log(`findOne: Token ${JSON.stringify(options)} does not exist.`);

        throw new NotFoundException();
      }

      throw e;
    }
  }

  /**
   * Store an instance of Account in database.
   * @param {Token} token
   * @param {EntityManager} transactionalEntityManager
   */
  public async save(token: Token, transactionalEntityManager?: EntityManager): Promise<Token> {
    this.logger.log(`save: Save an instance of ${token.id} in database.`);

    try {
      if (transactionalEntityManager) {
        return await transactionalEntityManager.save(token);
      }

      return await this.tokenRepository.save(token);
    } catch (e) {
      this.logger.error(`${e.code}: Could not fulfill the request to create an token ${token.id}.`);

      if (e.code === ResponseCodes.ER_DUP_ENTRY) {
        throw new ConflictException();
      }

      throw new InternalServerErrorException();
    }
  }

  update(
    criteria: Criteria<Token>,
    partialEntity: DeepPartial<Token>,
    transactionalEntityManager?: EntityManager,
  ): Promise<UpdateResult> {
    throw new InternalServerErrorException();
  }

  /**
   * @param {String} token
   */
  public async decode(token: string): Promise<any> {
    if (!token) {
      throw new BadRequestException();
    }

    return this.jwtService.decode(token);
  }

  /**
   * @param {Account} account
   * @param {String} ip
   * @param {EntityManager} transactionalEntityManager
   */
  public async generateActivateToken(
    account: Account,
    ip: string,
    transactionalEntityManager?: EntityManager,
  ): Promise<Token> {
    this.logger.log(`generateActiveToken: Generate activate token for account "${account.id}".`);

    const { expiresAt, token } = this.generateRandomToken(64, 3600000);

    const activateTokenEntity: Token = this.create({
      account,
      expiresAt,
      ip,
      token,
      type: TokenTypes.ACTIVATE_TOKEN,
    });

    return this.save(activateTokenEntity, transactionalEntityManager);
  }

  /**
   * @param {Number} length
   * @param {Number} lifeTime
   */
  public generateRandomToken(length: number, lifeTime: number): RandomToken {
    const currentTime: number = new Date().getTime();
    const token: string = nanoId(length);
    const expiresAt: Date = new Date(currentTime + lifeTime);

    return { token, expiresAt };
  }

  /**
   * @param {Account} account
   * @param {String} ip
   */
  public async generateRefreshToken(account: Account, ip: string): Promise<Token> {
    this.logger.log(`generateRefreshToken: Generate refresh token for account "${account.id}".`);

    const { expiresAt, token } = this.generateRandomToken(
      128,
      this.configService.get('auth.JWT_REFRESH_TOKEN_LIFETIME'),
    );

    const refreshTokenEntity: Token = this.create({
      account,
      expiresAt,
      ip,
      token,
      type: TokenTypes.REFRESH_TOKEN,
    });

    return this.save(refreshTokenEntity);
  }

  /**
   * Get the owner id of the token.
   * @param id
   */
  public async getAccountId(id: string): Promise<string> {
    const token = await this.tokenRepository.findOne(id);

    if (!token) {
      return null;
    }

    return token.accountId;
  }

  /**
   * @param {String} id
   */
  public async getTokens(id: string): Promise<Token[]> {
    this.logger.log(`getTokens: Preparing list of tokens associated with account ${id}.`);

    const account = await this.accountService.findOne({ where: { id }, relations: ['tokens'] });

    return account.tokens;
  }

  /**
   * @param {Token} token
   */
  public isTokenActive(token: Token): boolean {
    const currentDate = new Date();
    const { expiresAt } = token;

    return expiresAt <= currentDate;
  }

  /**
   * @param {String} accountId
   * @param {String} id
   */
  public async revokeToken(accountId: string, id: string): Promise<RevokeTokenResponse> {
    this.logger.log(`revokeToken: Account ${accountId} has requested to remove token ${id}.`);

    try {
      const token: Token = await this.findOne({ where: { id, type: TokenTypes.REFRESH_TOKEN } });
      await this.delete(token.id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }

      this.logger.error(
        `revokeToken: Account ${accountId} attempted to remove token ${id} which belongs to another account.`,
      );

      throw new UnauthorizedException();
    }

    this.logger.log(`revokeToken: Fulfilled the request of removing token ${id}.`);

    return { id };
  }

  public async validateTokenExpirationDate(token: Token): Promise<void> {
    if (this.isTokenActive(token)) {
      this.logger.log(`Token "${token.id}" expired.`);

      await this.delete(token.id);

      throw new UnauthorizedException();
    }
  }
}
