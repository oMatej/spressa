import { AuthenticateOptions, AuthorizeOptions, Response, Request, Token, TokenOptions } from 'oauth2-server';

export interface OAuthServer {
  authenticate(req: Request, res: Response, options?: AuthenticateOptions): Promise<Token>;

  authorize(req: Request, res: Response, options?: AuthorizeOptions): Promise<Token>;

  token(req: Request, res: Response, options?: TokenOptions): Promise<Token>;
}
