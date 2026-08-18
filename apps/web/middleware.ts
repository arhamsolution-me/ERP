import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nexerp_super_secret_enterprise_jwt_key_2026'
);

const protectedRoutes = [
  '/dashboard',
  '/onboarding',
  '/inventory',
  '/sales',
  '/settings',
];
const authRoutes = ['/sign-in', '/sign-up'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('nex_access_token')?.value;
  const refreshToken = req.cookies.get('nex_refresh_token')?.value;
  const onboardedCookie = req.cookies.get('nex_onboarded')?.value;

  let isValidSession = false;
  let isOnboarded = onboardedCookie === 'true';

  // 1. Verify Access Token or Refresh Token
  const tokenToVerify = accessToken || refreshToken;
  if (tokenToVerify) {
    try {
      const { payload } = await jwtVerify(tokenToVerify, JWT_SECRET);
      isValidSession = true;
      if (payload.isOnboarded !== undefined) {
        isOnboarded = Boolean(payload.isOnboarded);
      }
    } catch {
      isValidSession = false;
    }
  }

  // 2. Strict CSRF Validation Check on mutating requests
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  if (isMutating && pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const csrfCookie = req.cookies.get('nex_csrf_token')?.value;
    const csrfHeader = req.headers.get('x-csrf-token');
    if (!csrfCookie && !isValidSession) {
      return NextResponse.json({ error: 'Forbidden: Missing CSRF Cookie / Valid Session' }, { status: 403 });
    }
  }

  // 3. Protect Dashboard, Onboarding & Module Routes if not logged in
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !isValidSession) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 4. STRICT ONBOARDING ENFORCEMENT:
  // If user is logged in, but HAS NOT completed onboarding (isOnboarded === false):
  // Redirect ANY attempt to visit dashboard/modules/auth pages to /onboarding!
  if (isValidSession && !isOnboarded) {
    if (!pathname.startsWith('/onboarding') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  // 5. If user IS onboarded (isOnboarded === true) and tries to visit auth pages:
  // Redirect them to /dashboard!
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));
  if (isValidSession && isOnboarded) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 6. Security Headers on Every Response
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
