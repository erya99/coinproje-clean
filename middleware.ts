import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sadece /admin altını koru
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Login ve login API serbest
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/api/login')) {
    return NextResponse.next();
  }

  // Cookie kontrolü (Edge uyumlu, imza yok)
  const isAdmin = req.cookies.get('admin')?.value === '1';
  if (isAdmin) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
