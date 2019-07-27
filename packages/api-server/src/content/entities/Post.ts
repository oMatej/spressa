import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { Permission } from '../../authorization/enums';

import { EntityStatus } from '../enums';

import { BaseContent } from './BaseContent';
import { Comment } from './Comment';
import { Metadata } from './Metadata';

@Exclude()
@Entity({ name: 'posts' })
export class Post extends BaseContent {
  @Column({ name: 'title', type: 'text' })
  @Expose()
  title: string;

  @Column({ name: 'slug', unique: true })
  slug: string;

  @Column({ name: 'excerpt', type: 'text' })
  @Expose()
  excerpt: string;

  @Column({ name: 'content', type: 'longtext' })
  @Expose()
  content: string;

  @Column({ name: 'status', type: 'enum', enum: EntityStatus, default: EntityStatus.DRAFT })
  @Expose({ groups: [Permission.ADMIN] })
  status: EntityStatus;

  @OneToMany(type => Comment, comment => comment.post)
  comments: Comment[];

  @OneToMany(type => Metadata, metadata => metadata.post)
  metadata: Metadata[];
}
