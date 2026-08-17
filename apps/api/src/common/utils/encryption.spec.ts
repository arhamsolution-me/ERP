import { encryptPII, decryptPII } from './encryption';

describe('Encryption Utility', () => {
  const originalText = 'Hello, this is sensitive PII data!';
  
  it('should encrypt text into a different string', () => {
    const encrypted = encryptPII(originalText);
    
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(originalText);
    // Format check: iv:authTag:encryptedData
    expect(encrypted.split(':').length).toBe(3);
  });

  it('should decrypt text back to its original form', () => {
    const encrypted = encryptPII(originalText);
    const decrypted = decryptPII(encrypted);
    
    expect(decrypted).toBe(originalText);
  });

  it('should throw an error for malformed encrypted data', () => {
    expect(() => decryptPII('malformed:data')).toThrow();
  });
});
