import { encryptPII, decryptPII } from './encryption';

describe('Sensitive Field Encryption Suite (AES-256-GCM)', () => {
  it('should securely encrypt sensitive PII and decrypt back to exact original', () => {
    const sensitiveData = [
      '42101-1234567-1',          // National ID (CNIC)
      'PK36SCBL0000001123456701', // IBAN / Bank Account
      '923001234567',             // Personal Phone Number
      'sk_live_secret_key_vault', // Tenant API Key
    ];

    for (const secret of sensitiveData) {
      const encrypted = encryptPII(secret);
      expect(encrypted).not.toBe(secret);
      expect(encrypted.split(':')).toHaveLength(3); // IV : AuthTag : Ciphertext

      const decrypted = decryptPII(encrypted);
      expect(decrypted).toBe(secret);
    }
  });

  it('should return falsy/empty input untouched without error', () => {
    expect(encryptPII('')).toBe('');
    expect(decryptPII('')).toBe('');
  });

  it('should fail to decrypt tampered ciphertext or auth tag (integrity check)', () => {
    const original = 'secure-account-token';
    const encrypted = encryptPII(original);
    const parts = encrypted.split(':');

    // Tamper with ciphertext
    const tamperedCipher = parts[0] + ':' + parts[1] + ':' + parts[2].slice(0, -2) + 'aa';
    expect(() => decryptPII(tamperedCipher)).toThrow();

    // Tamper with auth tag
    const tamperedTag = parts[0] + ':' + '0'.repeat(32) + ':' + parts[2];
    expect(() => decryptPII(tamperedTag)).toThrow();
  });
});
