import { Entity, Column, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';

import { BaseEntity } from '../../commons/entities';
import { Account } from '../../account/entities';

import { TokenTypes } from '../enums';

@Entity({ name: 'tokens' })
export class Token extends BaseEntity {
  @Column({ name: 'token', unique: true, nullable: false })
  @Exclude()
  token: string;

  @Column({ name: 'ip', nullable: false })
  ip: string;

  @Column({ name: 'type', type: 'enum', enum: TokenTypes, default: TokenTypes.REFRESH_TOKEN })
  type: TokenTypes;

  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: Date;

  @Column()
  @Exclude()
  accountId: string;

  @ManyToOne(type => Account, account => account.tokens, { onDelete: 'CASCADE' })
  account: Account;
}
