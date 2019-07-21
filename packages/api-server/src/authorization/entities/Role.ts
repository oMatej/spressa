import { Entity, Column, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import * as slug from 'slug';

import { BaseEntity } from '../../commons/entities';
import { Account } from '../../account/entities';

import { Permission } from '../enums';

@Exclude()
@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Expose()
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'slug', unique: true })
  slug: string;

  @Expose()
  @Column({ name: 'description', nullable: true })
  description: string;

  @Expose({ groups: [Permission.ADMIN] })
  @Column({ name: 'is_default', type: 'bool', default: false })
  isDefault: boolean;

  @Expose({ groups: [Permission.ADMIN] })
  @Column({ name: 'permissions', type: 'simple-array', nullable: false })
  permissions: Permission[];

  @ManyToMany(type => Account, account => account.roles)
  @JoinTable({
    name: 'account_roles',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'accountId', referencedColumnName: 'id' },
  })
  accounts: Account[];

  @BeforeInsert()
  @BeforeUpdate()
  setSlug() {
    if (!this.slug) {
      this.slug = slug(this.name);
    }

    this.slug = this.slug.toLowerCase();
  }
}
