import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './lib/auth';

const OPEN_ADMIN_PATHS = [
  '/admin/login',
  '/admin/api/login',
  '/admin/api/logout',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  if (OPEN_ADMIN_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value || null;
  if (verifyAdminToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
