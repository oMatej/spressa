import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { ConfigService } from 'nestjs-config';

import { Authorize } from './decorators';
import { CreateRole, UpdateRole } from './dtos';
import { Role } from './entities';
import { Permission } from './enums';
import { PermissionGuard } from './guards';

import { RoleService } from './RoleService';

@Controller('/roles')
@UseGuards(PermissionGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RoleController {
  constructor(private readonly configService: ConfigService, private readonly roleService: RoleService) {}

  @Get('/')
  @Authorize(Permission.ADMIN)
  @SerializeOptions({
    groups: [Permission.ADMIN],
  })
  async getAll(): Promise<Role[]> {
    return this.roleService.find();
  }

  @Post('/')
  @Authorize(Permission.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createRoleBody: CreateRole) {
    return this.roleService.createRole(createRoleBody);
  }

  @Put('/:id')
  @Authorize(Permission.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateRoleBody: UpdateRole): Promise<Role> {
    return this.roleService.updateRole(id, updateRoleBody);
  }

  @Delete('/:id')
  @Authorize(Permission.ADMIN)
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return this.roleService.delete(id);
  }

  @Patch('/:id/status')
  @Authorize(Permission.ADMIN)
  async toggleStatus(@Param('id') id: string): Promise<Role> {
    return this.roleService.toggleRoleStatus(id);
  }
}
