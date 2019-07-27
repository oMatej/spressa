import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { Role } from '../../authorization/entities';
import { Permission } from '../../authorization/enums';
import { BaseEntity } from '../../commons/entities';
import { Post } from '../../content/entities';
import { Token } from '../../token/entities';

import { AccountStatus } from '../enums';

@Exclude()
@Entity({ name: 'accounts' })
export class Account extends BaseEntity {
  @Column({ name: 'email', unique: true })
  @Expose({ groups: [Permission.ADMIN] })
  email: string;

  @Column({ name: 'username', unique: true })
  @Expose()
  username: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'status', type: 'enum', enum: AccountStatus, default: AccountStatus.CREATED })
  @Expose({ groups: [Permission.ADMIN] })
  status: AccountStatus;

  @OneToMany(type => Post, post => post.account)
  posts: Post[];

  @Expose({ groups: [Permission.ADMIN] })
  @ManyToMany(type => Role, role => role.accounts)
  @JoinTable({
    name: 'account_roles',
    joinColumn: { name: 'account_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];

  @OneToMany(type => Token, token => token.account)
  tokens: Token[];

  @BeforeInsert()
  @BeforeUpdate()
  toLowerCase() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}
