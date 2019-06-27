import { Type } from 'class-transformer';

import { PaginationResponse } from '../../commons/dtos';

import { Account } from '../entities';

export class PaginationAccountResponse extends PaginationResponse {
  @Type(() => Account)
  readonly items: Account[];

  constructor({ total, page, limit, items }) {
    super({ total, page, limit });
    this.items = items;
  }
}
