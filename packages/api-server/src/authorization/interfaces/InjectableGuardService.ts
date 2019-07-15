export interface InjectableGuardService {
  getAccountId(id: string): Promise<string>;
}
