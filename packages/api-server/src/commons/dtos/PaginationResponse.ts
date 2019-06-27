export class PaginationResponse {
  readonly total: number;
  readonly page: number;
  readonly limit: number;

  constructor({ total, page, limit }) {
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
