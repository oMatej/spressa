import { createParamDecorator } from '@nestjs/common';

export const Account = createParamDecorator((key, req) => (key ? req.account[key] : req.account));
