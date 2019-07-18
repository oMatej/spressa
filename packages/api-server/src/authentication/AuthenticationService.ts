import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'nestjs-config';
import { MailerService } from '@nest-modules/mailer';
import { getManager } from 'typeorm';
import { SignOptions } from 'jsonwebtoken';
import * as uniq from 'lodash/uniq';
import * as isString from 'lodash/isString';

import { AccountService } from '../account';
import { Account } from '../account/entities';
import { Permission } from '../authorization/enums';
import { ENCRYPTION_SERVICE, EncryptionService } from '../encryption';
import { HASHING_SERVICE, HashingService } from '../hashing';
import { TokenService } from '../token';

import { SignUpBody } from './dtos';
import { Token } from '../token/entities';
import { TokenTypes } from '../token/enums';

export interface AuthResponse {
  readonly type: string;
  readonly token: string;
  readonly refreshToken: string;
}

export interface AuthPayload {
  readonly email: string;
  readonly username: string;
  readonly scopes: Permission[];
  readonly sub: string;
}

@Injectable()
export class AuthenticationService {
  static readonly prefix: string = 'Bearer';

  private readonly logger: Logger = new Logger(AuthenticationService.name, true);
  private readonly isProduction: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    @Inject(ENCRYPTION_SERVICE) private readonly encryptionService: EncryptionService,
    @Inject(HASHING_SERVICE) private readonly hashingService: HashingService,
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {
    this.isProduction = this.configService.get('core.IS_PRODUCTION');
  }

  /**
   * @param {String} activateToken
   */
  public async activate(activateToken: string) {
    this.logger.log(`activate: Requested account activation with the token "${activateToken}".`);

    const token: Token = await this.tokenService.findOne({
      where: { token: activateToken, type: TokenTypes.ACTIVATE_TOKEN },
      relations: ['account'],
    });

    await this.tokenService.validateTokenExpirationDate(token);

    const { account } = token;

    account.isActivated = true;

    await getManager().transaction(async transactionalEntityManager => {
      await this.tokenService.delete(token.id, transactionalEntityManager);
      await this.accountService.update(account, transactionalEntityManager);
    });

    this.logger.log(`activate: Activated account "${account.id}".`);

    return account;
  }

  /**
   * @param {String} uid
   * @param {String} password
   * @param {String} ip
   * @param {Object} jwtPayload
   * @param {SignOptions} jwtOptions
   */
  public async attempt(
    uid: string,
    password: string,
    ip: string,
    jwtPayload?: object,
    jwtOptions?: SignOptions,
  ): Promise<AuthResponse> {
    let account: Account;

    this.logger.log(`attempt: Attempted to log in on the account "${uid}".`);

    try {
      account = await this.accountService.findOne({ where: { email: uid }, relations: ['roles'] });
    } catch (e) {
      this.logger.log(`attempt: Account "${uid}" does not exist.`);

      throw new UnauthorizedException();
    }

    if (!account.isActivated) {
      this.logger.log(`attempt: Account "${uid}" is not activate.`);

      throw new ForbiddenException('Account is not active.');
    }

    const isVerified: boolean = await this.hashingService.verify(account.password, password);

    if (!isVerified) {
      this.logger.log(`attempt: Attempted to log in with on the account "${uid}" with incorrect credentials.`);

      throw new UnauthorizedException();
    }

    return this.generate(account, ip, jwtPayload, jwtOptions);
  }

  /**
   * @param {Account} account
   * @param {String} ip
   * @param {Object} jwtPayload
   * @param {SignOptions} jwtOptions
   */
  public async generate(
    account: Account,
    ip: string,
    jwtPayload?: object,
    jwtOptions?: SignOptions,
  ): Promise<AuthResponse> {
    const { id, email, username, roles = [] } = account;

    const scopes = roles.reduce((scope, { permissions }) => scope.concat(permissions), []);

    const payload: object = {
      email,
      username,
      scopes: uniq(scopes),
      ...jwtPayload,
    };

    const options: SignOptions = {
      subject: id,
      ...jwtOptions,
    };

    const token: string = this.jwtService.sign(payload, options);
    const { token: plainRefreshToken } = await this.tokenService.generateRefreshToken(account, ip);
    const refreshToken: string = plainRefreshToken ? this.encryptionService.encrypt(plainRefreshToken) : null;

    return { type: AuthenticationService.prefix, token, refreshToken };
  }

  /**
   * @param {String} refreshToken
   * @param {String} ip
   * @param {Object} jwtPayload
   * @param {SignOptions} jwtOptions
   */
  public async generateForRefreshToken(
    refreshToken: string,
    ip: string,
    jwtPayload?: object,
    jwtOptions?: SignOptions,
  ): Promise<AuthResponse> {
    let token: Token;

    try {
      token = await this.tokenService.findOne({
        where: {
          token: this.encryptionService.decrypt(refreshToken),
          type: TokenTypes.REFRESH_TOKEN,
        },
        relations: ['account', 'account.roles'],
      });
    } catch (e) {
      this.logger.warn('generateForRefreshToken: Attempt to use non-existent token.');

      throw new UnauthorizedException();
    }

    await this.tokenService.validateTokenExpirationDate(token);

    const { account } = token;

    if (!account) {
      this.logger.error(
        'generateForRefreshToken: Attempted to refresh token without an existing relationship with an account.',
      );

      throw new UnauthorizedException();
    }

    await this.tokenService.delete(token.id);

    return this.generate(account, ip, jwtPayload, jwtOptions);
  }

  /**
   * @param {SignUpBody} signUpBody
   * @param {String} ip
   */
  public async register(signUpBody: SignUpBody, ip: string): Promise<any> {
    const { acceptTerms, ...accountBody } = signUpBody;
    let account: Account;
    let token: Token;

    await getManager().transaction(async transactionalEntityManager => {
      account = await this.accountService.createAccount(accountBody, transactionalEntityManager);
      token = await this.tokenService.generateActivateToken(account, ip, transactionalEntityManager);
    });

    if (!account || !token) {
      throw new InternalServerErrorException();
    }

    this.logger.log(`register: Created account "${account.id}".`);

    // TODO: Implement sending emails as events.
    await this.sendActivationMail(account, ip, token);

    return account;
  }

  // TODO: Remove me.
  public async sendActivationMail(email: string, ip: string): Promise<void>;
  public async sendActivationMail(account: Account, ip: string, token: Token): Promise<void>;
  public async sendActivationMail(emailOrAccount: any, ip: string, token?: Token): Promise<void> {
    let account: Account;

    if (isString(emailOrAccount)) {
      account = await this.accountService.findOne({ where: { email: emailOrAccount, isActivated: false } });

      await this.tokenService.delete({ accountId: account.id, type: TokenTypes.ACTIVATE_TOKEN });

      token = await this.tokenService.generateActivateToken(account, ip);
    } else {
      account = emailOrAccount;
    }

    const { email, username } = account;
    const name = this.configService.get('core.SERVICE_NAME');
    const url = this.configService.get('core.SERVICE_URL');

    await this.mailerService.sendMail({
      to: this.isProduction ? email : 'jewel14@ethereal.email',
      subject: `${name}: Activate account ${username}`,
      text: `${url}/api/auth/activate/${token.token}`,
      html: `
        <h3>Hello, ${username}</h3>
        <p>
            You have to click on
            <strong><a href="${url}/auth/activate/${token.token}">THIS</a></strong>
            link to activate your account.
        </p>`,
    });
  }
}
