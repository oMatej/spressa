import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

import { BaseEntity } from '../../commons/entities';
import { Token } from '../../authentication/entities';
import { Role } from '../../authorization/entities';

@Entity({ name: 'accounts' })
export class Account extends BaseEntity {
  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'username', unique: true })
  username: string;

  @Column({ name: 'password' })
  @Exclude()
  password: string;

  @Column({ name: 'is_activated', type: 'bool', default: false })
  @Exclude()
  isActivated: boolean;

  @OneToMany(type => Token, token => token.account)
  tokens: Token[];

  @ManyToMany(type => Role)
  @JoinTable()
  roles: Role[];
}
