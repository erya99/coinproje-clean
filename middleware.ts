// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './lib/auth';

const ADMIN_AREA = '/admin';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Sadece /admin altını koru; login ve login API serbest
  const isAdmin = pathname === ADMIN_AREA || pathname.startsWith(ADMIN_AREA + '/');
  if (!isAdmin) return NextResponse.next();

  // açık bırakılan yollar
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/api/login' ||
    pathname === '/admin/api/logout'
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value;
  if (verifyAdminToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
