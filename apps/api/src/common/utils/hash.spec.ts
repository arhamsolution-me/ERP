import { hashText, verifyHash } from './hash';

describe('Hash Utility', () => {
  it('should hash a text successfully', async () => {
    const text = 'mySecurePassword123!';
    const hashed = await hashText(text);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(text);
    expect(hashed.startsWith('$argon2')).toBe(true);
  });

  it('should verify a correct hash', async () => {
    const text = 'superSecretData';
    const hashed = await hashText(text);

    const isValid = await verifyHash(hashed, text);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect hash', async () => {
    const text = 'superSecretData';
    const hashed = await hashText(text);

    const isValid = await verifyHash(hashed, 'wrongPassword');
    expect(isValid).toBe(false);
  });
});
