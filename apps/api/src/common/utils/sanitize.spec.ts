import { escapeHtml, sanitizeXss, escapeSqlLike, sanitizeObject } from './sanitize';

describe('Input Sanitization & XSS Prevention Suite', () => {
  describe('escapeHtml', () => {
    it('should escape HTML tags and special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const result = escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle single quotes and ampersands', () => {
      const input = "Tom & Jerry's";
      const result = escapeHtml(input);
      expect(result).toBe('Tom &amp; Jerry&#x27;s');
    });
  });

  describe('sanitizeXss', () => {
    it('should strip script tags completely', () => {
      const input = 'Hello <script>maliciousCode();</script>World';
      expect(sanitizeXss(input)).toBe('Hello World');
    });

    it('should strip javascript: URIs and inline event handlers', () => {
      const input = '<img src="x" onerror="alert(1)" />';
      const sanitized = sanitizeXss(input);
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).toBe('<img src="x" "alert(1)" />');
    });
  });

  describe('escapeSqlLike', () => {
    it('should escape SQL wildcard characters (%, _, \\)', () => {
      const input = '100%_bonus\\discount';
      const escaped = escapeSqlLike(input);
      expect(escaped).toBe('100\\%\\_bonus\\\\discount');
    });
  });

  describe('sanitizeObject', () => {
    it('should recursively sanitize deeply nested objects and arrays', () => {
      const input = {
        name: 'John <script>alert(1)</script>',
        profile: {
          bio: 'Engineer <script>evil()</script>',
          tags: ['tech', '<script>bad()</script>pos'],
        },
      };

      const result = sanitizeObject(input);
      expect(result.name).toBe('John ');
      expect(result.profile.bio).toBe('Engineer ');
      expect(result.profile.tags).toEqual(['tech', 'pos']);
    });
  });
});
