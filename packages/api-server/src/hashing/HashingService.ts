export interface HashingService {
  hash(plain: string): Promise<string>;

  verify(hash: string, plain: string): Promise<boolean>;
}
