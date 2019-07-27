import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { BaseEntity } from '../../commons/entities';
import { Page } from './Page';
import { Post } from './Post';

@Exclude()
@Entity({ name: 'metadata' })
export class Metadata extends BaseEntity {
  @Column({ name: 'name' })
  @Expose()
  name: string;

  @Column({ name: 'content' })
  @Expose()
  content: string;

  @Column({ name: 'property' })
  @Expose()
  property: string;

  @ManyToOne(type => Page, page => page.metadata)
  @JoinColumn({ name: 'page_id' })
  page: string;

  @ManyToOne(type => Post, post => post.metadata)
  @JoinColumn({ name: 'post_id' })
  post: string;
}
