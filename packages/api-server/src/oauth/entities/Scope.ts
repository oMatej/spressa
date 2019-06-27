import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../entities/BaseEntity';

@Entity({ name: 'scopes' })
export class Scope extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'is_default', type: 'boolean' })
  isDefault: boolean;
}
