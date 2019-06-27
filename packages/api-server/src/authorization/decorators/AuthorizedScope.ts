import { createParamDecorator } from '@nestjs/common';

export const AUTHORIZED_SCOPE_KEY = 'authorized_scope';

export const AuthorizedScope = createParamDecorator((key, req) => req[AUTHORIZED_SCOPE_KEY]);
