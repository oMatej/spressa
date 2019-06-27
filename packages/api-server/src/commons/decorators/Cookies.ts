import { createParamDecorator } from '@nestjs/common';

export const Cookies = createParamDecorator((name: string, req) => {
  return name ? req.cookies[name] : req.cookies;
});
