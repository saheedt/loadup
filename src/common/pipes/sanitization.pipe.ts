import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import DOMPurify from 'isomorphic-dompurify';

type SanitizableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SanitizableValue[]
  | { [key: string]: SanitizableValue };

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(
    value: SanitizableValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metadata: ArgumentMetadata,
  ): SanitizableValue {
    if (value === null || value === undefined) {
      return value;
    }

    return this.sanitizeValue(value);
  }

  private sanitizeValue(value: SanitizableValue): SanitizableValue {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized: { [key: string]: SanitizableValue } = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          sanitized[key] = this.sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeString(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }
}
