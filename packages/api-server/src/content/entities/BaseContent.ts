import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { Expose } from 'class-transformer';

import { Account } from '../../account/entities';
import { Permission } from '../../authorization/enums';
import { BaseEntity } from '../../commons/entities';

export class BaseContent extends BaseEntity {
  @Column({ name: 'author_ip' })
  @Expose({ groups: [Permission.ADMIN] })
  authorIP: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(type => Account, account => account.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  account: Account;
}
