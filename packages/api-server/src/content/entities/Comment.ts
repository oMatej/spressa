import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { Permission } from '../../authorization/enums';

import { EntityStatus } from '../enums';

import { BaseContent } from './BaseContent';
import { Post } from './Post';

@Exclude()
@Entity({ name: 'comments' })
export class Comment extends BaseContent {
  @Column({ name: 'content', type: 'text' })
  @Expose()
  content: string;

  @Column({ name: 'status', type: 'enum', enum: EntityStatus, default: EntityStatus.PUBLISHED })
  @Expose({ groups: [Permission.ADMIN] })
  status: EntityStatus;

  @OneToMany(type => Comment, comment => comment.parent)
  children: Comment[];

  @ManyToOne(type => Comment, comment => comment.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @ManyToOne(type => Post, post => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
