import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';

import { HashingService } from './HashingService';

@Injectable()
export class HashingArgonService implements HashingService {
  public async hash(plain: string): Promise<string> {
    return argon.hash(plain, { type: argon.argon2id });
  }

  public async verify(hash: string, plain: string): Promise<boolean> {
    return await argon.verify(hash, plain);
  }
}
