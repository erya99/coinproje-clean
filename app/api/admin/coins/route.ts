export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import slugify from '@sindresorhus/slugify';
import { prisma } from '@/lib/prisma';
import { ChainKind } from '@prisma/client';
import { verifyAdminToken } from '@/lib/auth';

/**
 * Admin: yeni coin ekleme (form-data)
 * Alanlar:
 *  - name (string, required)
 *  - symbol (string, required)
 *  - chainKind (ChainKind, required)
 *  - address (string, optional)
 *  - logo (File, optional)
 */
export async function POST(req: Request) {
  // ---- Auth (cookie'den token; TS için ?? null) ----
  const token = (req as any).cookies?.get?.('admin_token')?.value
    ?? (await getCookieFromHeader(req.headers, 'admin_token'));
  if (!verifyAdminToken(token ?? null)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();

  const name = String(form.get('name') ?? '').trim();
  const symbol = String(form.get('symbol') ?? '').trim().toUpperCase();
  const chainKindRaw = String(form.get('chainKind') ?? '').trim();
  const address = String(form.get('address') ?? '').trim() || null;

  if (!name || !symbol || !chainKindRaw) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  // ChainKind doğrulama
  const chainKind = chainKindRaw as ChainKind;
  const allowed = Object.keys(ChainKind) as (keyof typeof ChainKind)[];
  if (!allowed.includes(chainKind as any)) {
    return NextResponse.json({ ok: false, error: 'Invalid chainKind' }, { status: 400 });
  }

  // Logo yükleme (opsiyonel)
  let logoURI: string | null = null;
  const logo = form.get('logo');
  if (logo && typeof logo === 'object' && 'arrayBuffer' in logo) {
    const file = logo as File;
    if (file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const safeName =
        `${Date.now()}-${(file.name || 'logo.png').replace(/[^\w.\-]+/g, '_')}`;
      const filePath = path.join(uploadDir, safeName);
      await fs.writeFile(filePath, buf);

      logoURI = `/uploads/${safeName}`;
    }
  }

  // Slug benzersizliği
  const base = `${symbol}-${name}-${chainKind}`;
  let slug = slugify(base, { lowercase: true });
  for (let i = 1; i < 50; i++) {
    const exists = await prisma.coin.findUnique({ where: { slug } });
    if (!exists) break;
    slug = slugify(`${base}-${i}`, { lowercase: true });
  }

  // Kayıt
  const created = await prisma.coin.create({
    data: {
      name,
      symbol,
      chainKind,
      address,
      logoURI,
      slug,
      sources: ['admin'],
    },
  });

  return NextResponse.json({ ok: true, coin: created });
}

/** SSR/edge farklarından etkilenmemek için header’dan cookie okuma yardımcıları */
async function getCookieFromHeader(
  headers: Headers,
  key: string,
): Promise<string | undefined> {
  const raw = headers.get('cookie');
  if (!raw) return undefined;
  const parts = raw.split(/;\s*/g);
  for (const p of parts) {
    const [k, ...rest] = p.split('=');
    if (k === key) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}
