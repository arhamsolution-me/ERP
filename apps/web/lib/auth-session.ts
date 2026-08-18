import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nexerp_super_secret_enterprise_jwt_key_2026'
);

export interface AuthPayload {
  userId: string;
  tenantId: string;
  email: string;
  isOnboarded?: boolean;
  activeModules?: string[];
  type?: 'access' | 'refresh';
}

/**
 * Creates short-lived 15-minute Access Token (Docx 22 §1.1)
 */
export async function createAccessToken(payload: Omit<AuthPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

/**
 * Creates long-lived 7-day Refresh Token (Docx 22 §1.1)
 */
export async function createRefreshToken(payload: Omit<AuthPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies any JWT token
 */
export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * Reads session from cookies (supports both access token & refresh fallback)
 */
export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('nex_access_token')?.value;

  if (accessToken) {
    const session = await verifyAuthToken(accessToken);
    if (session && session.type !== 'refresh') return session;
  }

  // Fallback to refresh token if access token expired
  const refreshToken = cookieStore.get('nex_refresh_token')?.value;
  if (refreshToken) {
    const session = await verifyAuthToken(refreshToken);
    if (session) return session;
  }

  return null;
}

/**
 * Sets all Docx 22 compliant cookies on successful authentication
 */
export async function setAllAuthCookies(payload: Omit<AuthPayload, 'type'>) {
  const cookieStore = await cookies();
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
  const csrfToken = crypto.randomBytes(24).toString('hex');

  // 1. nex_access_token (15 min, HttpOnly, Strict)
  cookieStore.set('nex_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
  });

  // 2. nex_refresh_token (7 days, HttpOnly, Strict)
  cookieStore.set('nex_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // 3. nex_csrf_token (Double submit CSRF, JS accessible, Strict)
  cookieStore.set('nex_csrf_token', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  // 4. nex_tenant_hint (Non-sensitive convenience, 30 days)
  cookieStore.set('nex_tenant_hint', payload.tenantId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // 5. nex_onboarded (Onboarding status cookie)
  cookieStore.set('nex_onboarded', payload.isOnboarded ? 'true' : 'false', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  // 6. nex_active_modules (Active modules cookie for individual user session)
  if (payload.activeModules) {
    cookieStore.set('nex_active_modules', JSON.stringify(payload.activeModules), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

/**
 * Clears all auth cookies on logout (Docx 22 §1.2 Step 5)
 */
export async function clearAllAuthCookies() {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  };

  cookieStore.set('nex_access_token', '', options);
  cookieStore.set('nex_refresh_token', '', options);
  cookieStore.set('nex_csrf_token', '', { ...options, httpOnly: false });
}

// Backward compatibility helpers
export async function createAuthToken(payload: AuthPayload): Promise<string> {
  return createAccessToken(payload);
}

export async function setAuthCookie(token: string) {
  const session = await verifyAuthToken(token);
  if (session) {
    await setAllAuthCookies({
      userId: session.userId,
      tenantId: session.tenantId,
      email: session.email,
    });
  }
}

export async function clearAuthCookie() {
  await clearAllAuthCookies();
}
