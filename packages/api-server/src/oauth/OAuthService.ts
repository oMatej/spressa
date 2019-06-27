import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as OAuth2Server from 'oauth2-server';
import { isEmpty } from 'lodash';

import { OAuthServer } from './OAuthServer';
import { Client, Account, AuthCode, RefreshToken, Scope } from './entities';

import { ArgonService } from '../crypto';

@Injectable()
export class OAuthService implements OAuthServer {
  private readonly logger: Logger = new Logger(OAuthService.name, true);
  private readonly model:
    | OAuth2Server.AuthorizationCodeModel
    | OAuth2Server.ClientCredentialsModel
    | OAuth2Server.RefreshTokenModel
    | OAuth2Server.PasswordModel
    | OAuth2Server.ExtensionModel;
  private readonly server: OAuth2Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: ArgonService,
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
      verifyScope: this.verifyScope.bind(this),
      validateScope: this.validateScope.bind(this),
    };

    this.server = new OAuth2Server({
      model: this.model,
    });
  }

  static toArray(value: string): string[] {
    return value
      .replace(' ', '')
      .split(',')
      .filter(s => s !== '');
  }

  generateAccessToken(client: Client, account: Account, scope: string): string {
    this.logger.debug(
      `generateAccessToken: Signing JWT 'access_token' for account ${account.id} through client ${client.id}.`,
    );

    const payload = {
      authorities: [],
      scopes: OAuthService.toArray(scope),
      resources: client.resources,
    };

    const options = {
      issuer: client.id,
      subject: account.id,
      expiresIn: client.accessTokenLifetime,
    };

    return this.jwtService.sign(payload, options);
  }

  private generateAuthorizationCode() {
    this.logger.log('generateAuthorizationCode');
  }

  private generateRefreshToken(client: Client, account: Account, scope: string): string {
    this.logger.debug('generateRefreshToken: Preparing random `refresh_token`.');

    return this.cryptoService.random(64);
  }

  private async getAccessToken(accessToken: string): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    this.logger.debug('getAccessToken');

    return false;
  }

  private getAuthorizationCode() {
    this.logger.debug('getAuthorizationCode');
  }

  private async getClient(clientId: string, clientSecret: string): Promise<OAuth2Server.Client | OAuth2Server.Falsey> {
    this.logger.debug(`getClient: Looking for client '${clientId}'.`);

    const client = await this.clientRepository.findOne({
      clientId,
    });

    if (!client) {
      this.logger.debug(`getClient: Client '${clientId}' does not exist.`);
      throw new OAuth2Server.InvalidClientError('');
    }

    const isAuthenticated = await this.cryptoService.verify(client.clientSecret, clientSecret).catch(e => {
      this.logger.error(`getClient: 'client_secret' of '${clientId}' is corrupted: ${e.message}`);
      throw new OAuth2Server.UnauthorizedClientError('');
    });

    if (!isAuthenticated) {
      this.logger.debug(`getClient: Wrong 'client_secret' for '${clientId}'.`);
      throw new OAuth2Server.UnauthorizedClientError('');
    }

    this.logger.debug(`getClient: Found '${clientId}' client.`);
    return client;
  }

  private async getUser(username: string, password: string): Promise<Account | OAuth2Server.Falsey> {
    this.logger.debug(`getUser: Looking for account '${username}'.`);

    const account = await this.accountRepository.findOne({ username });

    if (!account) {
      this.logger.debug(`getUser: Account '${username}' does not exist.`);
      throw new OAuth2Server.AccessDeniedError('');
    }

    const isAuthenticated = await this.cryptoService.verify(account.password, password).catch(e => {
      this.logger.error(`getUser: 'password' of '${username}' is corrupted: ${e.message}`);
      throw new OAuth2Server.AccessDeniedError('');
    });

    if (!isAuthenticated) {
      this.logger.debug(`getUser: Wrong 'password' for ${username}.`);
      throw new OAuth2Server.AccessDeniedError('');
    }

    this.logger.debug(`getUser: Found '${username}' user.`);
    return account;
  }

  private getRefreshToken() {
    this.logger.debug('getRefreshToken');
  }

  private async getScopes(): Promise<Array<{ name: string; isDefault: boolean }>> {
    this.logger.debug('getScopes');

    return await this.scopeRepository.find({ select: ['name', 'isDefault'] });
  }

  private getUserFromClient() {
    this.logger.debug('getUserFromClient');
  }

  private async saveToken(
    token: OAuth2Server.Token,
    client: Client,
    account: Account,
  ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    this.logger.debug(
      'saveToken: Preparing the response object and executing the query to store "refresh_token" in the database.',
    );

    const refreshToken = this.refreshTokenRepository.create({
      token: token.refreshToken,
      expiresAt: token.refreshTokenExpiresAt,
      account,
      client,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      ...token,
      client: { id: client.id, grants: client.grants },
      user: { id: account.id },
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
    account: Account,
    client: Client,
    scope: string,
  ): Promise<string[] | OAuth2Server.Falsey> {
    this.logger.debug('validateScope');

    const validScopes = await this.getScopes();
    const defaultScope = validScopes.find(({ isDefault }) => isDefault) || { name: 'READ' };
    const requestedScopes = scope ? OAuthService.toArray(scope) : [defaultScope.name];

    if (isEmpty(client.scopes) && isEmpty(account.scopes)) {
      return [defaultScope.name];
    }

    if (!isEmpty(client.scopes) && !client.scopes.includes('*')) {
      const notSupportedScope = requestedScopes.find(s => !client.scopes.includes(s));

      if (notSupportedScope) {
        this.logger.debug(
          `validateScope: Requested scope '${notSupportedScope}' is not supported by client '${client.id}'.`,
        );
        return false;
      }
    }

    if (!isEmpty(account.scopes) && !account.scopes.includes('*')) {
      const notSupportedScope = requestedScopes.find(s => !account.scopes.includes(s));

      if (notSupportedScope) {
        this.logger.debug(
          `validateScope: Requested scope '${notSupportedScope}' is not supported by account '${client.id}'.`,
        );
        return false;
      }
    }

    return requestedScopes;
  }

  private verifyScope() {
    this.logger.debug('verifyScope');
    return false;
  }

  async token(req: OAuth2Server.Request, res: OAuth2Server.Response): Promise<OAuth2Server.Token> {
    return this.server.token(req, res);
  }

  authenticate(
    req: OAuth2Server.Request,
    res: OAuth2Server.Response,
    options?: OAuth2Server.AuthenticateOptions,
  ): Promise<OAuth2Server.Token> {
    throw new Error('Method not implemented.');
  }

  authorize(
    req: OAuth2Server.Request,
    res: OAuth2Server.Response,
    options?: OAuth2Server.AuthorizeOptions,
  ): Promise<OAuth2Server.Token> {
    throw new Error('Method not implemented.');
  }
}
