import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { DeepPartial, DeleteResult, EntityManager, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

import { Criteria, RepositoryFacade } from '../commons/interfaces';
import { ResponseCodes } from '../database/enums';

import { Role } from './entities';
import { RoleRepository } from './repositories';

@Injectable()
export class RoleService implements RepositoryFacade<Role> {
  private readonly logger: Logger = new Logger(RoleService.name, true);

  constructor(private readonly configService: ConfigService, private readonly roleRepository: RoleRepository) {}

  /**
   * @param {DeepPartial<Role>} entityLike
   */
  public create(entityLike: DeepPartial<Role>): Role {
    return this.roleRepository.create(entityLike);
  }

  /**
   * @param {Criteria<Role>} criteria
   * @param {EntityManager} transactionalEntityManager
   */
  public async delete(criteria: Criteria<Role>, transactionalEntityManager?: EntityManager): Promise<DeleteResult> {
    return this.roleRepository.delete(criteria);
  }

  /**
   * @param {FindManyOptions<Role>} options
   */
  public async find(options?: FindManyOptions<Role>): Promise<Role[]> {
    return this.roleRepository.find(options);
  }

  /**
   * @param {FindOneOptions<Role>} options
   */
  public async findOne(options?: FindOneOptions<Role>): Promise<Role> {
    this.logger.log(`findOne: Retrieving role. Options: ${JSON.stringify(options)}.`);

    try {
      const role: Role = await this.roleRepository.findOneOrFail(options);

      this.logger.log(`findOne: Found role "${role.id}".`);

      return role;
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        this.logger.log(`findOne: Role ${JSON.stringify(options)} does not exist.`);

        throw new NotFoundException();
      }

      throw e;
    }
  }

  /**
   * @param {String} id
   * @param {FindOneOptions<Role>} options
   */
  public async findOneById(id: string, options?: FindOneOptions<Role>): Promise<Role> {
    return this.findOne({ where: { id }, ...options });
  }

  /**
   * @param {Role} role
   * @param {EntityManager} transactionalEntityManager
   */
  public async save(role: Role, transactionalEntityManager?: EntityManager): Promise<Role> {
    try {
      if (transactionalEntityManager) {
        return await transactionalEntityManager.save(role);
      }

      return await this.roleRepository.save(role);
    } catch (e) {
      this.logger.warn(e.code);

      if (e.code === ResponseCodes.ER_DUP_ENTRY) {
        throw new ConflictException();
      }

      throw new InternalServerErrorException();
    }
  }

  /**
   * @param {Criteria<Role>} criteria
   * @param {DeepPartial<Role>} partialEntity
   * @param {EntityManager} transactionalEntityManager
   */
  public async update(
    criteria: Criteria<Role>,
    partialEntity: DeepPartial<Role>,
    transactionalEntityManager?: EntityManager,
  ): Promise<UpdateResult> {
    if (transactionalEntityManager) {
      return transactionalEntityManager.update(Role, criteria, partialEntity);
    }

    return this.roleRepository.update(criteria, partialEntity);
  }

  /**
   * @param {DeepPartial<Role>} createRoleBody
   */
  public async createRole(createRoleBody: DeepPartial<Role>): Promise<Role> {
    const role = this.create(createRoleBody);

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
   * @param {DeepPartial<Role>} updateRoleBody
   */
  public async updateRole(id: string, updateRoleBody: DeepPartial<Role>): Promise<Role> {
    const role: Role = await this.findOneById(id);

    const updatedRole: Role = this.roleRepository.merge(role, updateRoleBody);

    return this.save(updatedRole);
  }

  public async findDefaultRoles(): Promise<Role[]> {
    try {
      return this.find({ where: { isDefault: true } });
    } catch (e) {
      this.logger.warn('Could not fetch default roles.');
      return [];
    }
  }

  /**
   * @param {String} id
   */
  public async toggleRoleStatus(id: string): Promise<Role> {
    const role = await this.findOneById(id);

    role.isDefault = !role.isDefault;

    await this.save(role);

    return role;
  }
}
