// PATH: middleware.ts

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROOT = '/admin';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // /admin altında mı?
  if (!pathname.startsWith(ADMIN_ROOT)) return NextResponse.next();

  // /admin/login'i engelleme
  if (pathname === '/admin/login') return NextResponse.next();

  // Edge uyumlu: SADECE cookie var mı bak
  const hasToken = Boolean(req.cookies.get('admin_token')?.value);
  if (hasToken) return NextResponse.next();

  // login'e yönlendir (origin'i otomatik alır)
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname + (searchParams.size ? `?${searchParams.toString()}` : ''));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
