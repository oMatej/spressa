import { EntityRepository, Repository } from 'typeorm';

import { Permission } from '../entities';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {}
