import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  '/api/auth',
  '/api/health',
  '/api/videos',
  '/api/channels',
  '/api/podcasts',
  '/api/articles',
  '/api/reports',
];

const PUBLIC_METHODS = ['GET'];

function isPublicPath(pathname: string, method: string): boolean {
  if (method === 'GET' && pathname.startsWith('/api/videos')) return true;
  if (method === 'GET' && pathname.startsWith('/api/channels')) return true;
  if (method === 'GET' && pathname.startsWith('/api/podcasts')) return true;
  if (method === 'GET' && pathname.startsWith('/api/articles')) return true;
  if (method === 'GET' && pathname.startsWith('/api/playlists')) return true;
  if (method === 'GET' && pathname.startsWith('/api/live')) return true;

  for (const path of PUBLIC_PATHS) {
    if (pathname.startsWith(path)) return true;
  }

  return false;
}

function isProtectedPath(pathname: string): boolean {
  const protectedPrefixes = [
    '/api/admin',
    '/api/upload',
    '/api/dashboard',
    '/api/monetization',
    '/api/analytics',
    '/api/ai',
    '/api/subscriptions',
  ];

  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/health') {
      return NextResponse.next();
    }

    const response = NextResponse.next();

    response.headers.set('X-Request-Id', crypto.randomUUID());
    response.headers.set('X-Api-Version', 'v2');
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    response.headers.set('Access-Control-Max-Age', '86400');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    if (isProtectedPath(pathname)) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (pathname.startsWith('/api/admin') && token.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      response.headers.set('X-User-Id', token.id as string);
      response.headers.set('X-User-Role', token.role as string);
    }

    if (request.method !== 'GET' && !isPublicPath(pathname, request.method)) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required for this operation' },
          { status: 401 }
        );
      }
    }

    return response;
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
