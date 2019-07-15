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
import { Permission } from '../authorization/enums';
import { ENCRYPTION_SERVICE, EncryptionService } from '../encryption';
import { HASHING_SERVICE, HashingService } from '../hashing';

import { TokenRepository } from './repositories';
import { Account } from '../account/entities';
import { Token } from './entities';
import { TokenTypes } from './enums';

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
export class TokenService {
  static readonly prefix: string = 'Bearer';

  private readonly logger: Logger = new Logger(TokenService.name, true);
  private readonly isProduction: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    @Inject(ENCRYPTION_SERVICE) private readonly encryptionService: EncryptionService,
    @Inject(HASHING_SERVICE) private readonly hashingService: HashingService,
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly tokenRepository: TokenRepository,
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

  /**
   * @param {Account} account
   * @param {String} ip
   */
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

  /**
   * @param {Account} account
   * @param {String} ip
   */
  private async generateRefreshToken(account: Account, ip: string): Promise<string> {
    const { expiresAt, token } = this.generateRandomToken(
      128,
      this.configService.get('auth.JWT_REFRESH_TOKEN_LIFETIME'),
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
}
