import { ArgumentMetadata } from '@nestjs/common';
import { SanitizationPipe } from './sanitization.pipe';

describe('SanitizationPipe', () => {
  let pipe: SanitizationPipe;
  let mockMetadata: ArgumentMetadata;

  beforeEach(() => {
    pipe = new SanitizationPipe();
    mockMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    };
  });

  describe('String Sanitization', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello';
      const result = pipe.transform(malicious, mockMetadata);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
    });

    it('should remove HTML tags but keep content', () => {
      const input = '<div>Hello <strong>World</strong></div>';
      const result = pipe.transform(input, mockMetadata);
      expect(result).toBe('Hello World');
    });

    it('should remove img tags with onerror attribute', () => {
      const malicious = '<img src=x onerror=alert(1)>';
      const result = pipe.transform(malicious, mockMetadata);
      expect(result).not.toContain('<img');
      expect(result).not.toContain('onerror');
    });

    it('should preserve plain text', () => {
      const text = 'This is plain text with special chars: @#$%';
      const result = pipe.transform(text, mockMetadata);
      expect(result).toBe(text);
    });

    it('should handle empty string', () => {
      const result = pipe.transform('', mockMetadata);
      expect(result).toBe('');
    });

    it('should remove iframe tags', () => {
      const malicious = '<iframe src="evil.com"></iframe>';
      const result = pipe.transform(malicious, mockMetadata);
      expect(result).not.toContain('<iframe');
    });

    it('should remove style tags', () => {
      const input = '<style>body { background: red; }</style>Text';
      const result = pipe.transform(input, mockMetadata);
      expect(result).toBe('Text');
    });
  });

  describe('Array Sanitization', () => {
    it('should sanitize all strings in an array', () => {
      const malicious = [
        '<script>alert(1)</script>',
        'Safe text',
        '<img src=x onerror=alert(2)>',
      ];
      const result = pipe.transform(malicious, mockMetadata);
      expect(result).toEqual(['', 'Safe text', '']);
    });

    it('should handle mixed type arrays', () => {
      const mixed = ['<script>bad</script>', 123, true, null];
      const result = pipe.transform(mixed, mockMetadata);
      expect(result).toEqual(['', 123, true, null]);
    });

    it('should handle nested arrays', () => {
      const nested = [['<script>bad</script>', 'good'], ['<div>text</div>']];
      const result = pipe.transform(nested, mockMetadata);
      expect(result).toEqual([['', 'good'], ['text']]);
    });
  });

  describe('Object Sanitization', () => {
    it('should sanitize all string properties', () => {
      const malicious = {
        name: '<script>evil</script>John',
        email: 'test@example.com',
        bio: '<img src=x onerror=alert(1)>',
      };
      const result = pipe.transform(
        malicious,
        mockMetadata,
      ) as typeof malicious;
      expect(result.name).toBe('John');
      expect(result.email).toBe('test@example.com');
      expect(result.bio).toBe('');
    });

    it('should handle nested objects', () => {
      const nested = {
        user: {
          name: '<script>bad</script>Alice',
          details: {
            description: '<div>Hello</div>',
          },
        },
      };
      const result = pipe.transform(nested, mockMetadata) as typeof nested;
      expect(result.user.name).toBe('Alice');
      expect(result.user.details.description).toBe('Hello');
    });

    it('should preserve non-string properties', () => {
      const mixed = {
        text: '<script>bad</script>',
        number: 42,
        boolean: true,
        nullValue: null,
      };
      const result = pipe.transform(mixed, mockMetadata) as typeof mixed;
      expect(result.text).toBe('');
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.nullValue).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input', () => {
      const result = pipe.transform(null, mockMetadata);
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = pipe.transform(undefined, mockMetadata);
      expect(result).toBeUndefined();
    });

    it('should handle numbers', () => {
      const result = pipe.transform(123, mockMetadata);
      expect(result).toBe(123);
    });

    it('should handle booleans', () => {
      const result = pipe.transform(true, mockMetadata);
      expect(result).toBe(true);
    });

    it('should preserve legitimate special characters', () => {
      const text = 'Email: test@example.com, Price: $100, Rating: 5/5';
      const result = pipe.transform(text, mockMetadata);
      expect(result).toBe(text);
    });
  });

  describe('Real-world Attack Scenarios', () => {
    it('should prevent XSS through event handlers', () => {
      const attacks = [
        '<img src=x onerror=alert(1)>',
        '<body onload=alert(1)>',
        '<svg onload=alert(1)>',
        '<input onfocus=alert(1) autofocus>',
      ];

      attacks.forEach((attack) => {
        const result = pipe.transform(attack, mockMetadata);
        expect(result).not.toContain('alert');
        expect(result).not.toContain('onerror');
        expect(result).not.toContain('onload');
        expect(result).not.toContain('onfocus');
      });
    });

    it('should prevent javascript: protocol', () => {
      const malicious = '<a href="javascript:alert(1)">Click me</a>';
      const result = pipe.transform(malicious, mockMetadata);
      expect(result).toBe('Click me');
    });

    it('should prevent data: URI attacks', () => {
      const malicious =
        '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      const result = pipe.transform(malicious, mockMetadata);
      expect(result).toBe('Click');
    });
  });
});
