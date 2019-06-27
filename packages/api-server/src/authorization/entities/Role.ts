import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';

import { BaseEntity } from '../../commons/entities';
import { Permission } from './Permission';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'slug' })
  slug: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @ManyToMany(type => Permission)
  @JoinTable()
  permissions: Permission[];
}
