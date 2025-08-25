import crypto from 'crypto';
import { cookies } from 'next/headers';
import 'server-only';

const NAME = 'admin_token';
const SECRET = process.env.ADMIN_SECRET || 'dev-secret';

function sign(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

export const runtime = 'nodejs';

export function createAdminToken(username: string) {
  const payload = JSON.stringify({ u: username, t: Date.now() });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token) return false;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return false;
  const good = sign(b64) === sig;
  return good;
}

export function setAdminCookie(token: string) {
  cookies().set(NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
    maxAge: 60 * 60 * 8, // 8 saat
  });
}

export function clearAdminCookie() {
  cookies().delete(NAME);
}

export function getAdminTokenFromCookies() {
  return cookies().get(NAME)?.value;
}
