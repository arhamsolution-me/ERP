import * as argon2 from 'argon2';

/**
 * Hash a plain text string (e.g., API Key, password) using Argon2id.
 * Argon2id is the recommended algorithm for password hashing.
 */
export async function hashText(plainText: string): Promise<string> {
  return argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,         // 3 iterations
    parallelism: 1,      // 1 thread
  });
}

/**
 * Verify a plain text string against a previously hashed string.
 */
export async function verifyHash(hashedText: string, plainText: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedText, plainText);
  } catch (error) {
    return false;
  }
}
