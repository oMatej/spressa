import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import * as nanoId from 'nanoid';

import { HashService } from './HashService';

@Injectable()
export class ArgonHashService implements HashService {
  public async hash(plain: string): Promise<string | Error> {
    return argon.hash(plain, { type: argon.argon2id });
  }

  public async verify(hash: string, plain: string): Promise<boolean | Error> {
    return await argon.verify(hash, plain);
  }

  public random(length?: number): string {
    return nanoId(length);
  }
}
