import { EntityRepository, Repository } from 'typeorm';

import { Token } from '../entities';

@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {}
