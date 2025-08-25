import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API'yi asla yakalama
  if (pathname.startsWith('/api')) return NextResponse.next();

  // Sadece /admin altını koru
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Login sayfası serbest
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  // Cookie kontrolü
  if (req.cookies.get('admin')?.value === '1') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'], // api için early-return var
};
