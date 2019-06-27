import { Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import * as SimpleEncryptor from 'simple-encryptor';

@Injectable()
export class EncryptionService {
  private readonly encryptor: SimpleEncryptor.SimpleEncryptor;

  constructor(private readonly configService: ConfigService) {
    this.encryptor = (SimpleEncryptor as any)({
      key: configService.get('core.APP_SECRET_KEY'),
    });
  }

  public encrypt(payload: any): string {
    return this.encryptor.encrypt(payload);
  }

  public decrypt(payload: string): any {
    return this.encryptor.decrypt(payload);
  }
}
