import { EncryptionService } from './EncryptionService';

export const EncryptionProvider = {
  provide: 'EncryptionService',
  useClass: EncryptionService,
};
