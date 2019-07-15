import { HashingArgonService } from './HashingArgonService';
import { HASHING_SERVICE } from './constants';

export const HashingProvider = {
  provide: HASHING_SERVICE,
  useClass: HashingArgonService,
};
