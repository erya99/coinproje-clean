import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_auth', 'ok', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
