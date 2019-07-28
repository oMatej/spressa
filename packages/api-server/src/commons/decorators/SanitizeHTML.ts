import { SanitizerInterface, SanitizerConstraint } from 'class-sanitizer';
import * as sanitizeHtml from 'sanitize-html';

@SanitizerConstraint()
export class SanitizeHTML implements SanitizerInterface {
  sanitize(text: string): string {
    return sanitizeHtml(text);
  }
}
