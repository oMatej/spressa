import { EncryptionService } from './EncryptionService';
import { ENCRYPTION_SERVICE } from './constants';

export const EncryptionProvider = {
  provide: ENCRYPTION_SERVICE,
  useClass: EncryptionService,
};
