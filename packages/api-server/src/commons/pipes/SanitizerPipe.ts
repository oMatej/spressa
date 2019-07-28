import { ArgumentMetadata, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { sanitize } from 'class-sanitizer';

class SanitizerPipeOptions {
  readonly transform?: boolean;
}

@Injectable()
export class SanitizerPipe implements PipeTransform {
  private readonly isTransformEnabled: boolean = false;

  constructor(@Optional() options: SanitizerPipeOptions = {}) {
    const { transform } = options;
    this.isTransformEnabled = !!transform;
  }

  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype) {
      return value;
    }

    const entity = plainToClass(metatype, value);

    sanitize(entity);

    return this.isTransformEnabled ? entity : classToPlain(entity);
  }
}
