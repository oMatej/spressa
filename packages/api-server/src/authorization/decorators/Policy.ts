import { SetMetadata } from '@nestjs/common';

export const POLICIES_KEY = 'policies';

export const Policy = (policies: object) => SetMetadata(POLICIES_KEY, policies);
