import { Controller } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

@Controller('/permissions')
export class TokenController {
  constructor(private readonly configService: ConfigService) {}
}
