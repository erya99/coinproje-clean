export const runtime = 'nodejs';

import crypto from 'crypto';

type Payload = { u: string; iat?: number; exp?: number };

// base64url yardımcıları
const b64 = {
  encode: (buf: Buffer | string) =>
    Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''),
  decode: (str: string) =>
    Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
};

function getSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error('ADMIN_SECRET is not set');
  return s;
}

// Cookie adı
export const ADMIN_COOKIE = 'admin_token';

// 7 gün
const DEFAULT_TTL = 60 * 60 * 24 * 7;

export function signAdminToken(input: { u: string; ttlSeconds?: number }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    u: input.u,
    iat: now,
    exp: now + (input.ttlSeconds ?? DEFAULT_TTL),
  };

  const h = b64.encode(JSON.stringify(header));
  const p = b64.encode(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest();
  const s = b64.encode(sig);
  return `${data}.${s}`;
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expect = b64.encode(crypto.createHmac('sha256', getSecret()).update(data).digest());
  if (s !== expect) return false;

  try {
    const payload = JSON.parse(b64.decode(p)) as Payload;
    if (!payload.u) return false;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

// Route handler içinden cookie okuma kolaylığı:
export function getAdminTokenFromRequest(req: Request): string | null {
  const raw = req.headers.get('cookie') ?? '';
  const m = raw.split(/;\s*/).find(c => c.startsWith(`${ADMIN_COOKIE}=`));
  return m ? decodeURIComponent(m.split('=')[1]) : null;
}
