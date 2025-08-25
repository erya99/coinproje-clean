export const runtime = 'nodejs';

import crypto from 'crypto';

const ADMIN_SECRET   = process.env.ADMIN_SECRET   ?? 'change-me';
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? '';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

function sign(payload: string) {
  return crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
}

// TOKEN ÜRET
export function makeAdminToken() {
  const base = `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`;
  return `${base}.${sign(base)}`;
}

// TOKEN DOĞRULA (undefined/null gelebilir)
export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const [base, sig] = token.split('.');
  if (!base || !sig) return false;
  return sign(base) === sig;
}
