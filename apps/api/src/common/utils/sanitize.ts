/**
 * Escapes HTML characters to prevent Cross-Site Scripting (XSS).
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips script tags, javascript: URIs, and inline event handlers (onerror, onload, etc.).
 */
export function sanitizeXss(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/\bon\w+\s*=/gi, '');
}

/**
 * Escapes wildcards for SQL LIKE queries to prevent LIKE-injection pattern exhaustion.
 */
export function escapeSqlLike(str: string): string {
  if (typeof str !== 'string') return str;
  return str.replace(/[%_\\]/g, '\\$&');
}

/**
 * Recursively sanitizes strings in objects, arrays, and primitive inputs.
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return sanitizeXss(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeObject(item)) as unknown as T;
  }
  if (typeof input === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }
  return input;
}
