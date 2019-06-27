import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthorizationService {
  private readonly logger: Logger = new Logger(AuthorizationService.name, true);

  constructor() {}
}
