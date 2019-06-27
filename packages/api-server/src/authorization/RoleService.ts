import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { FindManyOptions } from 'typeorm';
import * as slug from 'slug';

import { ResponseCodes } from '../database/enums';

import { Role } from './entities';
import { RoleRepository } from './repositories';
import { CreateRole, DeleteRoleResponse } from './dtos';

@Injectable()
export class RoleService {
  private readonly logger: Logger = new Logger(RoleService.name, true);

  constructor(private readonly configService: ConfigService, private readonly roleRepository: RoleRepository) {}

  private getSlug(role: CreateRole): string {
    if (role.slug) {
      return role.slug.toLowerCase();
    }

    return slug(role.name).toLowerCase();
  }

  /**
   * @param {Role} role
   */
  private async save(role: Role) {
    try {
      return await this.roleRepository.save(role);
    } catch (e) {
      this.logger.warn(`Role with slug ${role.slug} already exists.`);

      if (e.code === ResponseCodes.ER_DUP_ENTRY) {
        throw new ConflictException();
      }

      throw new InternalServerErrorException();
    }
  }

  /**
   * @param {CreateRole} createRoleBody
   */
  public async create(createRoleBody: CreateRole): Promise<Role> {
    const role = this.roleRepository.create({
      ...createRoleBody,
      slug: this.getSlug(createRoleBody),
    });

    try {
      const count = await this.roleRepository.count();
      role.isDefault = count === 0 ? true : role.isDefault;
    } catch (e) {
      throw new InternalServerErrorException();
    }

    return this.save(role);
  }

  /**
   * @param {String} id
   */
  public async delete(id: string): Promise<DeleteRoleResponse> {
    await this.roleRepository.delete({ id });

    return { id };
  }

  /**
   * @param {FindManyOptions} options
   */
  public async find(options?: FindManyOptions): Promise<Role[]> {
    return this.roleRepository.find(options);
  }

  /**
   * @param {String} id
   */
  public async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne(id);

    if (!role) {
      throw new NotFoundException();
    }

    return role;
  }

  public async getDefault(): Promise<Role[]> {
    try {
      return this.find({ where: { isDefault: true } });
    } catch (e) {
      this.logger.warn('Could not fetch default roles.');
      return [];
    }
  }

  /**
   * @param {String} id
   * @param {CreateRole} updateRoleBody
   */
  public async update(id: string, updateRoleBody: CreateRole): Promise<Role> {
    const role = await this.findById(id);

    const updatedRole = await this.roleRepository.create({
      ...role,
      ...updateRoleBody,
      slug: this.getSlug(updateRoleBody),
    });

    await this.save(updatedRole);

    return updatedRole;
  }

  /**
   * @param {String} id
   */
  public async toggleStatus(id: string): Promise<Role> {
    const role = await this.findById(id);

    role.isDefault = !role.isDefault;

    await this.save(role);

    return role;
  }
}
