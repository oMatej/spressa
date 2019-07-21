import { IsArray, IsEnum, IsOptional } from 'class-validator';

import { Permission } from '../enums';

import { CreateRole } from './CreateRole';

export class UpdateRole extends CreateRole {
  @IsArray()
  @IsOptional()
  @IsEnum(Permission, { each: true })
  readonly permissions: Permission[];
}
