import { HashingArgonService } from './HashingArgonService';

export const HashingProvider = {
  provide: 'HashingService',
  useClass: HashingArgonService,
};
