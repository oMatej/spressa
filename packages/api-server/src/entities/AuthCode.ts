import { Entity, Column, ManyToOne } from 'typeorm';

import { BaseEntity } from './BaseEntity';
import { Account } from './Account';
import { Client } from './Client';

@Entity({ name: 'auth_codes' })
export class AuthCode extends BaseEntity {
  @Column({ name: 'code', unique: true, nullable: false })
  code: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: string;

  @ManyToOne(type => Account, account => account.codes)
  account: Account;

  @ManyToOne(type => Client, client => client.codes)
  client: Client;
}
