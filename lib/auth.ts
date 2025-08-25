// lib/auth.ts
import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SECRET   = process.env.ADMIN_SECRET   || 'change_me';

export function checkAdminCredentials(u: string, p: string) {
  return u === ADMIN_USERNAME && p === ADMIN_PASSWORD;
}

// çok basit imzalı token (JWT kullanmak istemiyoruz)
export function signAdminToken(payload: Record<string, any>, maxAgeSec = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000);
  const data = { ...payload, iat: now, exp: now + maxAgeSec };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyAdminToken(token?: string | null) {
  if (!token) return false;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return false;
  const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(encoded).digest('base64url');
  if (expected !== sig) return false;
  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}
