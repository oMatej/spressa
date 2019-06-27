import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from './BaseEntity';
import { Account } from './Account';
import { AuthCode } from './AuthCode';
import { RefreshToken } from './RefreshToken';

@Entity({ name: 'client_details' })
export class Client extends BaseEntity {
  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'client_secret' })
  clientSecret: string;

  @Column({ name: 'resource_ids', type: 'simple-array' })
  resources: string[];

  @Column({ name: 'scope', type: 'simple-array' })
  scopes: string[];

  @Column({ name: 'grant_types', type: 'simple-array' })
  grants: string[];

  @Column({ name: 'access_token_lifetime', type: 'integer' })
  accessTokenLifetime: number;

  @Column({ name: 'refresh_token_lifetime', type: 'integer' })
  refreshTokenLifetime: number;

  @ManyToOne(type => Account, account => account.clients)
  account: Account;

  @OneToMany(type => AuthCode, code => code.client)
  codes: AuthCode[];

  @OneToMany(type => RefreshToken, refreshToken => refreshToken.client)
  refreshTokens: AuthCode[];
}
