import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from '../../entities/BaseEntity';
import { AuthCode } from './AuthCode';
import { Client } from './Client';
import { RefreshToken } from './RefreshToken';

@Entity({ name: 'accounts' })
export class Account extends BaseEntity {
  @Column({ name: 'username', unique: true })
  username: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'scope', type: 'simple-array' })
  scopes: string[];

  @OneToMany(type => Client, client => client.account)
  clients: Client[];

  @OneToMany(type => AuthCode, code => code.account)
  codes: AuthCode[];

  @OneToMany(type => RefreshToken, refreshToken => refreshToken.account)
  refreshTokens: AuthCode[];
}
