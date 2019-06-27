import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'nestjs-config';
import { MailerService } from '@nest-modules/mailer';
import { SignOptions } from 'jsonwebtoken';
import * as nanoId from 'nanoid';
import * as uniq from 'lodash/uniq';
import * as isString from 'lodash/isString';

import { AccountService } from '../account';
import { Account } from '../account/entities';
import { Permission } from '../authorization/enums';
import { EncryptionService } from '../encryption';
import { HashingService } from '../hashing';

import { RevokeTokenResponse, SignUpBody } from './dtos';
import { Token } from './entities';
import { TokenTypes } from './enums';
import { TokenRepository } from './repositories';

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
    @Inject('EncryptionService') private readonly encryptionService: EncryptionService,
    @Inject('HashingService') private readonly hashingService: HashingService,
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly tokenRepository: TokenRepository,
    private readonly mailerService: MailerService,
  ) {
    this.isProduction = this.configService.get('core.IS_PRODUCTION');
  }

  /**
   * @param {Number} length
   * @param {Number} lifeTime
   */
  private generateRandomToken(length: number, lifeTime: number): { token: string; expiresAt: Date } {
    const currentTime: number = new Date().getTime();
    const token: string = nanoId(length);
    const expiresAt: Date = new Date(currentTime + lifeTime);

    return { token, expiresAt };
  }

  private async generateActivateToken(account: Account, ip: string): Promise<Token> {
    this.logger.log(`generateActiveToken: Generate active token for account "${account.id}".`);

    const { expiresAt, token } = this.generateRandomToken(64, 3600000);

    const activateTokenEntity = this.tokenRepository.create({
      account,
      expiresAt,
      ip,
      token,
      type: TokenTypes.ACTIVATE_TOKEN,
    });

    await this.tokenRepository.save(activateTokenEntity);

    return activateTokenEntity;
  }

  private async generateRefreshToken(account: Account, ip: string): Promise<string> {
    const { expiresAt, token } = this.generateRandomToken(
      128,
      this.configService.get('core.JWT_REFRESH_TOKEN_LIFETIME'),
    );

    const refreshTokenEntity: Token = this.tokenRepository.create({
      account,
      expiresAt,
      ip,
      token,
      type: TokenTypes.REFRESH_TOKEN,
    });

    await this.tokenRepository.save(refreshTokenEntity);

    return refreshTokenEntity.token;
  }

  public async activate(activateToken: string) {
    const token = await this.tokenRepository.findOne({
      where: { token: activateToken, type: TokenTypes.ACTIVATE_TOKEN },
      relations: ['account'],
    });

    if (!token) {
      throw new NotFoundException();
    }

    const currentDate = new Date();
    const { account, expiresAt } = token;

    if (expiresAt <= currentDate) {
      await this.tokenRepository.remove(token);

      throw new UnauthorizedException();
    }

    account.isActivated = true;

    await this.accountService.update(account);

    return account;
  }

  public async attempt(
    uid: string,
    password: string,
    ip: string,
    jwtPayload?: object,
    jwtOptions?: SignOptions,
  ): Promise<AuthResponse> {
    let account: Account;

    try {
      account = await this.accountService.findOne({ where: { email: uid }, relations: ['roles'] });
    } catch (e) {
      throw new UnauthorizedException();
    }

    if (!account.isActivated) {
      throw new ForbiddenException('Account is not active.');
    }

    const isVerified: boolean = await this.hashingService.verify(account.password, password);

    if (!isVerified) {
      throw new UnauthorizedException();
    }

    return this.generate(account, ip, jwtPayload, jwtOptions);
  }

  public async check(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }

  public async generate(
    account: Account,
    ip: string,
    jwtPayload?: object,
    jwtOptions?: SignOptions,
  ): Promise<AuthResponse> {
    const { id, email, username, roles = [] } = account;

    // TODO: ??
    const scopes = roles.reduce((scope, { permissions }) => scope.concat(permissions), []);

    const payload: object = {
      email,
      username,
      scopes: uniq(scopes),
      ...jwtPayload,
    };

    const options: SignOptions = {
      subject: id,
      // expiresIn: '5m',
      ...jwtOptions,
    };

    const token: string = this.jwtService.sign(payload, options);
    const plainRefreshToken: string = await this.generateRefreshToken(account, ip);
    const refreshToken: string = plainRefreshToken ? this.encryptionService.encrypt(plainRefreshToken) : null;

    return { type: AuthenticationService.prefix, token, refreshToken };
  }

  public async generateForRefreshToken(
    refreshToken: string,
    ip: string,
    jwtPayload?: object,
    jwtOptions?: SignOptions,
  ): Promise<AuthResponse> {
    const token = await this.tokenRepository.findOne({
      where: {
        token: this.encryptionService.decrypt(refreshToken),
        type: TokenTypes.REFRESH_TOKEN,
      },
      relations: ['account', 'account.roles'],
    });

    if (!token) {
      this.logger.warn('Attempt to use non-existent token.');

      throw new UnauthorizedException();
    }

    const currentDate = new Date();
    const { account, expiresAt } = token;

    if (expiresAt <= currentDate) {
      this.logger.log(`Attempt to refresh expired token.`);

      await this.tokenRepository.remove(token);

      throw new UnauthorizedException();
    }

    if (!account) {
      this.logger.error('Attempted to refresh token without an existing relationship with an account.');

      throw new UnauthorizedException();
    }

    await this.tokenRepository.remove(token);

    return this.generate(account, ip, jwtPayload, jwtOptions);
  }

  public async getTokens(id: string): Promise<Token[]> {
    this.logger.log(`Preparing list of tokens associated with account ${id}.`);

    const account = await this.accountService.findOne({ where: { id }, relations: ['tokens'] });

    return account.tokens;
  }

  public async register(signUpBody: SignUpBody, ip: string): Promise<any> {
    const { acceptTerms, ...accountBody } = signUpBody;

    const account: Account = await this.accountService.createAccount(accountBody);
    const token: Token = await this.generateActivateToken(account, ip);

    await this.sendActivationMail(account, ip, token);

    return account;
  }

  public async revokeToken(accountId: string, id: string): Promise<RevokeTokenResponse> {
    this.logger.log(`Account ${accountId} has requested to remove token ${id}.`);

    const token = await this.tokenRepository.findOne({ where: { accountId, id } });

    if (!token) {
      this.logger.error(`Account ${accountId} attempted to remove token ${id} which belongs to another account.`);

      throw new UnauthorizedException();
    }

    await this.tokenRepository.delete(id);

    this.logger.log(`Fulfilled the request of removing token ${id}.`);

    return { id };
  }

  public async sendActivationMail(email: string, ip: string): Promise<void>;
  public async sendActivationMail(account: Account, ip: string, token: Token): Promise<void>;
  public async sendActivationMail(emailOrAccount: any, ip: string, token?: Token): Promise<void> {
    let account: Account;

    if (isString(emailOrAccount)) {
      account = await this.accountService.findOne({ where: { email: emailOrAccount, isActivated: false } });

      await this.tokenRepository.delete({ accountId: account.id, type: TokenTypes.ACTIVATE_TOKEN });

      token = await this.generateActivateToken(account, ip);
    } else {
      account = emailOrAccount;
    }

    const { email, username } = account;
    const name = this.configService.get('core.SERVICE_NAME');
    const url = this.configService.get('core.SERVICE_URL');

    console.log({ name, url });

    await this.mailerService.sendMail({
      to: this.isProduction ? email : 'ronny77@ethereal.email',
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
