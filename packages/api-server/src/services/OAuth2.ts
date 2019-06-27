import * as OAuth2Server from 'oauth2-server';

export interface OAuth2 {
  authenticate(
    req: OAuth2Server.Request,
    res: OAuth2Server.Response,
    options?: OAuth2Server.AuthenticateOptions,
  ): Promise<OAuth2Server.Token | OAuth2Server.OAuthError>;

  authorize(
    req: OAuth2Server.Request,
    res: OAuth2Server.Response,
    options?: OAuth2Server.AuthorizeOptions,
  ): Promise<OAuth2Server.Token | OAuth2Server.OAuthError>;

  token(
    req: OAuth2Server.Request,
    res: OAuth2Server.Response,
    options?: OAuth2Server.TokenOptions,
  ): Promise<OAuth2Server.Token | OAuth2Server.OAuthError>;
}
