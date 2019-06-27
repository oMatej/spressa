import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as OAuth2Server from 'oauth2-server';

import { OAuth2 } from './OAuth2';
import { Client, Account, AuthCode, RefreshToken, Scope } from '../entities';
import { ArgonHashService } from './ArgonHashService';

@Injectable()
export class OAuthService implements OAuth2 {
  private readonly logger: Logger = new Logger(OAuthService.name, true);
  private readonly model: OAuth2Server.PasswordModel;
  // | OAuth2Server.AuthorizationCodeModel
  // | OAuth2Server.ClientCredentialsModel
  // | OAuth2Server.RefreshTokenModel
  // | OAuth2Server.PasswordModel
  // | OAuth2Server.ExtensionModel;
  private readonly server: OAuth2Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly argonHashService: ArgonHashService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(AuthCode)
    private readonly authCodeRepository: Repository<AuthCode>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Scope)
    private readonly scopeRepository: Repository<Scope>,
  ) {
    this.model = {
      generateAccessToken: this.generateAccessToken.bind(this),
      generateRefreshToken: this.generateRefreshToken.bind(this),
      getAccessToken: this.getAccessToken.bind(this),
      getClient: this.getClient.bind(this),
      getUser: this.getUser.bind(this),
      saveToken: this.saveToken.bind(this),
      verifyScope: this.validateScope.bind(this),
    };

    this.server = new OAuth2Server({
      model: this.model,
    });
  }

  async generateAccessToken(
    client: OAuth2Server.Client,
    user: OAuth2Server.User,
    scope: string | string[],
  ): Promise<string> {
    this.logger.debug('generateAccessToken: generating JWT access token');

    const payload = {
      authorities: [],
      scopes: scope,
      resources: client.resources,
    };

    const options = {
      issuer: client.id,
      subject: user.id,
      expiresIn: client.accessTokenLifetime,
    };

    this.logger.debug({ payload, options });

    return this.jwtService.sign(payload, options);
  }

  private async generateRefreshToken(
    client: OAuth2Server.Client,
    user: OAuth2Server.User,
    scope: string | string[],
  ): Promise<string> {
    this.logger.debug('generateRefreshToken');

    return this.argonHashService.random(64);
  }

  private generateAuthorizationCode() {
    // this.logger.log('generateAuthorizationCode');
  }

  private async getAccessToken(
    accessToken: string,
  ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    this.logger.debug('getAccessToken');

    return false;
  }

  private getRefreshToken() {
    this.logger.debug('getRefreshToken');
  }

  private getAuthorizationCode() {
    this.logger.debug('getAuthorizationCode');
  }

  private async getClient(
    clientId: string,
    clientSecret: string,
  ): Promise<OAuth2Server.Client | OAuth2Server.Falsey> {
    this.logger.debug(
      `getClient: finding client for clientId:clientSecret combination: ${clientId}:${clientSecret}`,
    );

    const client = await this.clientRepository.findOne({
      clientId,
    });

    if (!client) {
      this.logger.debug('getClient: client does not exist');
      return undefined;
    }

    if (
      !(await this.argonHashService.verify(client.clientSecret, clientSecret))
    ) {
      this.logger.debug('getClient: client secret mismatch');
      return undefined;
    }

    this.logger.debug('getClient: found client with matching id and secret');
    return client;
  }

  private async getUser(
    username: string,
    password: string,
  ): Promise<OAuth2Server.User | OAuth2Server.Falsey> {
    this.logger.debug('getUser');

    const account = await this.accountRepository.findOne({ username });

    if (!account) {
      this.logger.debug('getUser: account does not exist');
      return undefined;
    }

    if (!(await this.argonHashService.verify(account.password, password))) {
      this.logger.debug('getUser: account password mismatch');
      return undefined;
    }

    this.logger.debug(
      'getClient: found account with matching username and password',
    );
    return account;
  }

  private getUserFromClient() {
    this.logger.debug('getUserFromClient');
  }

  private async saveToken(
    token: OAuth2Server.Token,
    client: Client,
    account: Account,
  ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    this.logger.debug('saveToken');

    const refreshToken = this.refreshTokenRepository.create({
      token: token.refreshToken,
      expiresAt: token.refreshTokenExpiresAt,
      account,
      client,
    });

    await this.refreshTokenRepository.save(refreshToken);
    const { password, ...user } = account;

    return {
      ...token,
      client,
      user,
    };
  }

  private saveAuthorizationCode() {
    this.logger.debug('saveAuthorizationCode');
  }

  private revokeToken() {
    this.logger.debug('revokeToken');
  }

  private revokeAuthorizationCode() {
    this.logger.debug('revokeAuthorizationCode');
  }

  private async validateScope(
    token: OAuth2Server.Token,
    scope: string | string[],
  ): Promise<boolean> {
    this.logger.debug('validateScope');

    return false;
  }

  private verifyScope() {
    this.logger.debug('verifyScope');
  }

  async token(req, res): Promise<OAuth2Server.Token | OAuth2Server.OAuthError> {
    try {
      Logger.debug('TEST', OAuthService.name);
      const test = this.jwtService.sign({ test: true });
      const token = await this.server.token(req, res);
      console.log({ token, test });
      return token;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  authenticate(
    req: OAuth2Server.Request,
    res: OAuth2Server.Response,
    options?: OAuth2Server.AuthenticateOptions,
  ): Promise<OAuth2Server.Token | OAuth2Server.OAuthError> {
    throw new Error('Method not implemented.');
  }
  authorize(
    req: OAuth2Server.Request,
    res: OAuth2Server.Response,
    options?: OAuth2Server.AuthorizeOptions,
  ): Promise<OAuth2Server.Token | OAuth2Server.OAuthError> {
    throw new Error('Method not implemented.');
  }
}
