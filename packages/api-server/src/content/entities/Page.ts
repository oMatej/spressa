import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { Permission } from '../../authorization/enums';

import { EntityStatus } from '../enums';

import { BaseContent } from './BaseContent';
import { Metadata } from './Metadata';

@Exclude()
@Entity({ name: 'pages' })
export class Page extends BaseContent {
  @Column({ name: 'title', type: 'text' })
  @Expose()
  title: string;

  @Column({ name: 'slug', unique: true })
  slug: string;

  @Column({ name: 'content', type: 'longtext' })
  @Expose()
  content: string;

  @Column({ name: 'status', type: 'enum', enum: EntityStatus, default: EntityStatus.DRAFT })
  @Expose({ groups: [Permission.ADMIN] })
  status: EntityStatus;

  @OneToMany(type => Metadata, metadata => metadata.page)
  metadata: Metadata[];
}
