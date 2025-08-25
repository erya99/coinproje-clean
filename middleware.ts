import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

const ADMIN_PREFIX = '/admin';

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Sadece /admin altını koru
  if (!pathname.startsWith(ADMIN_PREFIX)) return NextResponse.next();

  // Login sayfası koruma dışı
  if (pathname === '/admin/login') return NextResponse.next();

  const token = req.cookies.get('admin_token')?.value ?? null;
  if (verifyAdminToken(token)) return NextResponse.next();

  // Yetkisiz -> login'e yönlendir
  const url = new URL('/admin/login', origin);
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
