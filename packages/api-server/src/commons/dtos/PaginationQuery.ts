import { IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationQuery {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly page: number = 1;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly limit: number = 10;

  @IsEnum(Order)
  readonly order: string = Order.ASC;
}
