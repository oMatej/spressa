import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../commons/entities';

@Entity({ name: 'permissions' })
export class Permission extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'slug' })
  slug: string;

  @Column({ name: 'description', type: 'text' })
  description: string;
}
