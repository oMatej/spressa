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
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

import { Authorize } from './decorators';
import { CreateRole, DeleteRoleResponse } from './dtos';
import { Role } from './entities';
import { Permission } from './enums';
import { PermissionGuard } from './guards';

import { RoleService } from './RoleService';

@Controller('/roles')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly configService: ConfigService, private readonly roleService: RoleService) {}

  @Get('/')
  @Authorize(Permission.ADMIN)
  async getAll(): Promise<Role[]> {
    return this.roleService.find();
  }

  @Post('/')
  @Authorize(Permission.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createRoleBody: CreateRole) {
    return this.roleService.create(createRoleBody);
  }

  @Put('/:id')
  @Authorize(Permission.ADMIN)
  async update(@Param('id') id: string, @Body() updateRoleBody: CreateRole): Promise<Role> {
    return this.roleService.update(id, updateRoleBody);
  }

  @Delete('/:id')
  @Authorize(Permission.ADMIN)
  async delete(@Param('id') id: string): Promise<DeleteRoleResponse> {
    return this.roleService.delete(id);
  }

  @Patch('/:id/status')
  @Authorize(Permission.ADMIN)
  async toggleStatus(@Param('id') id: string): Promise<Role> {
    return this.roleService.toggleStatus(id);
  }
}
