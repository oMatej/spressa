import { Entity, Column, ManyToOne } from 'typeorm';

import { BaseEntity } from './BaseEntity';
import { Account } from './Account';
import { Client } from './Client';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken extends BaseEntity {
  @Column({ name: 'token', type: 'uuid', unique: true, nullable: false })
  token: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: Date;

  @ManyToOne(type => Account, account => account.refreshTokens)
  account: Account;

  @ManyToOne(type => Client, client => client.refreshTokens)
  client: Client;
}

// id: objectId().str,
//     token: 'cba19635-3bb4-47b1-87f6-8d0ff26b43f2', // refresh_token
//     expires: new Date('2019-05-30 00:00'), // expires_at
//     scope: 'posts:read',
//     user_id: '5ce63c0a5a25992818e5347e',
//     client_id: '5ce63c0a5a25992818e5347d',
//
// table.uuid('id').primary().unique();
// table.uuid('account_id').notNullable();
// table.uuid('client_id').notNullable();
// table.string('token', 40).unique().notNullable();
