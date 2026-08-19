/**
 * DevStore Fallback Environment Guard
 *
 * This guard ensures that the in-memory mock store (devStore) is NEVER
 * reachable or used as a fallback in production environments, staging environments,
 * or anytime the explicit opt-in flag ALLOW_DEV_STORE_FALLBACK is not set to 'true'.
 */

export function isDevStoreFallbackAllowed(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_DEV_STORE_FALLBACK === 'true'
  );
}
