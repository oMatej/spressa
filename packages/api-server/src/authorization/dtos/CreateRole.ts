import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Permission } from '../enums';

export class CreateRole {
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  readonly slug: string;

  @IsOptional()
  readonly description: string;

  @IsArray()
  @IsEnum(Permission, { each: true })
  readonly permissions: Permission[];

  @IsOptional()
  @Type(() => Boolean)
  readonly isDefault: boolean = false;
}
