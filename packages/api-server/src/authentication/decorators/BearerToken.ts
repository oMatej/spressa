import { createParamDecorator } from '@nestjs/common';

import { AuthenticationService } from '../AuthenticationService';

export const BearerToken = createParamDecorator((data, req) => {
  const [type, token] = (req.headers.authorization || '').split(' ');

  return type === AuthenticationService.prefix && token;
});
