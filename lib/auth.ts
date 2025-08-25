// lib/auth.ts
const ALG = 'HS256';

// --- Node tarafı (API routes) imzalama
export function signAdminToken(payload: Record<string, any>): string {
  // minimal JWT (header.payload.signature)
  const header = { alg: ALG, typ: 'JWT' };
  const enc = (obj: any) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const part1 = enc(header);
  const part2 = enc({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  });
  const data = `${part1}.${part2}`;

  const crypto = require('crypto') as typeof import('crypto');
  const hmac = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET as string)
    .update(data)
    .digest('base64url');

  return `${data}.${hmac}`;
}

// --- Edge tarafı (middleware) doğrulama
export function verifyAdminToken(token: string | null): boolean {
  try {
    if (!token) return false;
    const [p1, p2, p3] = token.split('.');
    if (!p1 || !p2 || !p3) return false;
    const data = `${p1}.${p2}`;

    const keyBytes = new TextEncoder().encode(process.env.ADMIN_SECRET || '');
    const algoKey = { name: 'HMAC', hash: 'SHA-256' } as const;

    // @ts-ignore - WebCrypto Edge
    return (globalThis.crypto?.subtle
      ? globalThis.crypto.subtle
      : (require('crypto').webcrypto.subtle)
    )
      .importKey('raw', keyBytes, algoKey, false, ['sign'])
      .then((key: CryptoKey) =>
        (globalThis.crypto?.subtle || require('crypto').webcrypto.subtle).sign(
          algoKey,
          key,
          new TextEncoder().encode(data)
        )
      )
      .then((sig: ArrayBuffer) => {
        const b64 = Buffer.from(new Uint8Array(sig)).toString('base64url');
        return b64 === p3;
      })
      .catch(() => false) as unknown as boolean;
  } catch {
    return false;
  }
}
