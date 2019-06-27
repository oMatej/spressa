import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import * as nanoId from 'nanoid';

import { HashService } from './HashService';
import { RandomService } from './RandomService';

@Injectable()
export class ArgonService implements HashService, RandomService {
  public async hash(plain: string): Promise<string> {
    return argon.hash(plain, { type: argon.argon2id });
  }

  public async verify(hash: string, plain: string): Promise<boolean> {
    return await argon.verify(hash, plain);
  }

  public random(length?: number): string {
    return nanoId(length);
  }
}
