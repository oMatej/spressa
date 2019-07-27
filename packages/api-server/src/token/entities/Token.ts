import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { BaseEntity } from '../../commons/entities';
import { Account } from '../../account/entities';

import { TokenTypes } from '../enums';

@Exclude()
@Entity({ name: 'tokens' })
export class Token extends BaseEntity {
  @Column({ name: 'token', unique: true, nullable: false })
  token: string;

  @Column({ name: 'ip', nullable: false })
  ip: string;

  @Expose()
  @Column({ name: 'type', type: 'enum', enum: TokenTypes, default: TokenTypes.REFRESH_TOKEN })
  type: TokenTypes;

  @Expose()
  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: Date;

  @Column({ name: 'account_id' })
  accountId: string;

  @ManyToOne(type => Account, account => account.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
