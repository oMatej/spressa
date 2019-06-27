import { Controller, Post, Req, Res } from '@nestjs/common';
import * as OAuth2Server from 'oauth2-server';

import { OAuthService } from './OAuthService';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('authorize')
  authorize(): string {
    return '';
  }

  @Post('token')
  async token(@Req() req, @Res() res): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    try {
      const request = new OAuth2Server.Request(req);
      const response = new OAuth2Server.Response(res);

      const result = await this.oauthService.token(request, response);

      return res.send(result);
    } catch (e) {
      return res.send(e);
    }
  }
}
