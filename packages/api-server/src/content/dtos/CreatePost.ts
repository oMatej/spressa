import { Sanitize } from 'class-sanitizer';
import { SanitizeHTML } from '../../commons/decorators';

export class CreatePost {
  readonly title: string;

  @Sanitize(SanitizeHTML)
  readonly content: string;
}
