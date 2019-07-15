import { Type } from 'class-transformer';

import { PaginationResponse } from '../../commons/dtos';

import { Account } from '../entities';

export class PaginationAccountResponse extends PaginationResponse {
  @Type(() => Account)
  readonly items: Account[];

  constructor({ items, page, pages, total }) {
    super({ page, pages, total });
    this.items = items;
  }
}
