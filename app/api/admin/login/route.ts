export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { createAdminToken, setAdminCookie } from '@/lib/auth';


export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  const U = process.env.ADMIN_USERNAME;
  const P = process.env.ADMIN_PASSWORD;

  if (!U || !P) {
    return NextResponse.json({ ok: false, error: 'Admin env vars missing' }, { status: 500 });
  }

  if (username === U && password === P) {
    const token = createAdminToken(username);
    // cookie yaz
    // Not: setAdminCookie sunucu actionlarında çalışır; route handler’da header ile set edelim
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
      maxAge: 60 * 60 * 8,
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
}
