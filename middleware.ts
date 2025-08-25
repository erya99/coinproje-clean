import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './lib/auth';

const ADMIN_PATHS = ['/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAdmin = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!needsAdmin) return NextResponse.next();

  // login sayfasına koruma uygulamayacağız
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  const token = req.cookies.get('admin_token')?.value;
  if (verifyAdminToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
