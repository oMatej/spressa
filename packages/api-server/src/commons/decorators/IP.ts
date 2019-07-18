import { createParamDecorator } from '@nestjs/common';

export const IP = createParamDecorator((data, req) => {
  return req.connection.remoteAddress || req.headers['x-forwarded-for'];
});
