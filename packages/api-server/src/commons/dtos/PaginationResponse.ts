export class PaginationResponse {
  readonly total: number;
  readonly currentPage: number;
  readonly totalPages: number;

  constructor({ page, pages, total }) {
    this.total = total;
    this.currentPage = page;
    this.totalPages = pages;
  }
}
