import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';

import { BaseEntity } from '../../commons/entities';
import { Account } from '../../account/entities';

import { Permission } from '../enums';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'slug', unique: true })
  slug: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'is_default', type: 'bool', default: false })
  isDefault: boolean;

  @Column({ name: 'permissions', type: 'simple-array', nullable: false })
  permissions: Permission[];

  @ManyToMany(type => Account, account => account.roles)
  @JoinTable({
    name: 'account_roles',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'accountId', referencedColumnName: 'id' },
  })
  accounts: Account[];
}
