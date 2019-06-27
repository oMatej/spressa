import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'nestjs-config';
import { SignOptions } from 'jsonwebtoken';
import * as nanoId from 'nanoid';

import { AccountService } from '../account';
import { EncryptionService } from '../encryption';
import { HashingService } from '../hashing';

import { Account } from '../account/entities';
import { TokenTypes } from './enums';
import { TokenRepository } from './repositories';

export interface AuthResponse {
  readonly type: string;
  readonly token: string;
  readonly refreshToken: string;
}

export interface AuthPayload {
  readonly username: string;
  readonly sub: string;
}

@Injectable()
export class AuthenticationService {
  private readonly logger: Logger = new Logger(AuthenticationService.name, true);

  constructor(
    private readonly configService: ConfigService,
    @Inject('EncryptionService') private readonly encryptionService: EncryptionService,
    @Inject('HashingService') private readonly hashingService: HashingService,
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  private async generateRefreshToken(account: Account): Promise<string> {
    const currentTime = new Date().getTime();
    const token = nanoId(128);
    const expiresAt = new Date(currentTime + this.configService.get('core.JWT_REFRESH_TOKEN_LIFETIME'));

    const refreshTokenEntity = this.tokenRepository.create({
      account,
      expiresAt,
      token,
      type: TokenTypes.REFRESH_TOKEN,
    });
    await this.tokenRepository.save(refreshTokenEntity);

    return refreshTokenEntity.token;
  }

  public async attempt(
    uid: string,
    password: string,
    jwtPayload?: object,
    jwtOptions?: SignOptions,
  ): Promise<AuthResponse> {
    let account: Account;

    try {
      account = await this.accountService.getAccount({ email: uid });
    } catch (e) {
      throw new UnauthorizedException();
    }

    const isVerified = await this.hashingService.verify(account.password, password);

    if (!isVerified) {
      throw new UnauthorizedException();
    }

    return this.generate(account, jwtPayload, jwtOptions);
  }

  public async check(token: string): Promise<any> {
    return this.jwtService.decode(token.replace('Bearer ', ''));
  }

  public async generate(account: Account, jwtPayload?: object, jwtOptions?: SignOptions): Promise<AuthResponse> {
    // @ts-ignore
    const { id, email, username } = account;

    const payload = {
      email,
      username,
      ...jwtPayload,
    };

    const options = {
      subject: id,
      ...jwtOptions,
    };

    const token = this.jwtService.sign(payload, options);
    const plainRefreshToken = await this.generateRefreshToken(account);

    const refreshToken = plainRefreshToken ? this.encryptionService.encrypt(plainRefreshToken) : null;

    return { type: 'bearer', token, refreshToken };
  }

  public async generateForRefreshToken(
    refreshToken: string,
    jwtPayload: object,
    jwtOptions: SignOptions,
  ): Promise<AuthResponse> {
    const { id, accountId } = await this.tokenRepository.findOne({
      where: { token: this.encryptionService.decrypt(refreshToken), type: TokenTypes.REFRESH_TOKEN },
    });

    const account = await this.accountService.getAccountById(accountId);

    if (!account) {
      throw new UnauthorizedException();
    }

    const token = await this.generate(account, jwtPayload, jwtOptions);
    await this.tokenRepository.delete(id);

    return token;
  }
}
