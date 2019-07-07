import { EntityRepository, Repository } from 'typeorm';

import { Account } from '../entities';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {}
