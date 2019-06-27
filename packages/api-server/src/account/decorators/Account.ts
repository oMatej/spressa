import { createParamDecorator } from '@nestjs/common';

export const Account = createParamDecorator((key, req) => {
  return key ? req.account[key] : req.account;
});
