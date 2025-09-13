import { headers } from 'next/headers';

export function absUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;

  // ENV öncelikli; prod için koyacağız
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return `${env.replace(/\/$/, '')}${path}`;

  // Proxy arkasında güvenli çözüm
  const h = headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host =
    h.get('x-forwarded-host') ??
    h.get('host') ??
    'localhost:3000';

  return `${proto}://${host}${path}`;
}
