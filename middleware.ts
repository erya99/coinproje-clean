import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Admin bölgesi kökleri
const ADMIN_GUARDS = ['/admin'];

/**
 * Middleware sadece admin_token çerezi VAR MI diye bakar.
 * Token'ın kriptografik doğrulaması sayfa ve API route'larında yapılır
 * (oralar Node.js runtime, 'crypto' kullanılabilir).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login ve /admin/api/* serbest
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/api')) {
    return NextResponse.next();
  }

  // Admin guard alanı mı?
  const needsAdmin = ADMIN_GUARDS.some(
    (base) => pathname === base || pathname.startsWith(base + '/'),
  );
  if (!needsAdmin) return NextResponse.next();

  // Sadece çerez var mı diye bak
  const hasToken = !!req.cookies.get('admin_token')?.value;
  if (hasToken) return NextResponse.next();

  // login'e yönlendir
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

// Sadece admin yollarını dinle
export const config = {
  matcher: ['/admin/:path*'],
};
