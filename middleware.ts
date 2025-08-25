import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './lib/auth';

const OPEN_ADMIN_PATHS = [
  '/admin/login',
  '/admin/api/login',
  '/admin/api/logout',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sadece /admin altını koru
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Login & auth API yollarını korumadan muaf tut
  if (OPEN_ADMIN_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Token kontrolü
  const token = req.cookies.get('admin_token')?.value || null;
  if (verifyAdminToken(token)) {
    return NextResponse.next();
  }

  // Yetkisiz -> login sayfasına yönlendir
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
