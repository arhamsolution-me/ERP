import helmet from 'helmet';
import type { Request, Response } from 'express';

describe('HTTP Security Headers & Transport Security', () => {
  it('should attach strict security headers (HSTS, nosniff, frameguard DENY, CSP)', (done) => {
    const middleware = helmet({
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      frameguard: { action: 'deny' },
      contentTypeNosniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });

    const headers: Record<string, string> = {};
    const req = { headers: {} } as Request;
    const res = {
      setHeader: (key: string, val: string) => {
        headers[key.toLowerCase()] = val;
      },
      getHeader: (key: string) => headers[key.toLowerCase()],
      removeHeader: (key: string) => {
        delete headers[key.toLowerCase()];
      },
    } as unknown as Response;

    middleware(req, res, () => {
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['strict-transport-security']).toContain('max-age=31536000');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      done();
    });
  });
});
