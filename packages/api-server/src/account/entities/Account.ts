import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { Role } from '../../authorization/entities';
import { Permission } from '../../authorization/enums';
import { BaseEntity } from '../../commons/entities';
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

  @OneToMany(type => Token, token => token.account)
  tokens: Token[];

  @Expose({ groups: [Permission.ADMIN] })
  @ManyToMany(type => Role, role => role.accounts)
  @JoinTable({
    name: 'account_roles',
    joinColumn: { name: 'accountId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @BeforeInsert()
  @BeforeUpdate()
  toLowerCase() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}
