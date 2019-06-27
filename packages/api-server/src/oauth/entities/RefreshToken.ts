import { Entity, Column, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../entities/BaseEntity';
import { Account } from './Account';
import { Client } from './Client';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken extends BaseEntity {
  @Column({ name: 'token', type: 'uuid', unique: true, nullable: false })
  token: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: Date;

  @Column()
  accountId: string;

  @Column()
  clientId: string;

  @ManyToOne(type => Account, account => account.refreshTokens)
  account: Account;

  @ManyToOne(type => Client, client => client.refreshTokens)
  client: Client;
}
