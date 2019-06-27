export interface HashService {
  hash(plain: string): Promise<string | Error>;

  verify(hash: string, plain: string): Promise<boolean | Error>;

  random(length?: number): string;
}
