import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums';

export const PERMISSIONS_KEY = 'permissions';

export const Authorize = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
