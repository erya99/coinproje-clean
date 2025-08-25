export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import slugify from '@sindresorhus/slugify';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // ---- AUTH
  const token: string | null = req.cookies.get('admin_token')?.value ?? null;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ---- FORM
  const form = await req.formData();
  const name = String(form.get('name') || '').trim();
  const symbol = String(form.get('symbol') || '').trim().toUpperCase();
  const chainKind = String(form.get('chainKind') || '').trim();
  const address = (String(form.get('address') || '').trim() || null) as string | null;
  const file = form.get('logo') as File | null;

  if (!name || !symbol || !chainKind) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  // ---- LOGO KAYIT (opsiyonel)
  let logoURI: string | null = null;
  if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name || '').toLowerCase() || '.png';
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'coins');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), bytes);
    logoURI = `/uploads/coins/${fileName}`;
  }

  // ---- SLUG
  const base = `${symbol}-${name}-${chainKind}`;
  let slug = slugify(base, { lowercase: true });
  for (let i = 1; i < 50; i++) {
    const exists = await prisma.coin.findUnique({ where: { slug } });
    if (!exists) break;
    slug = slugify(`${base}-${i}`, { lowercase: true });
  }

  // ---- DB
  await prisma.coin.create({
    data: {
      name,
      symbol,
      chainKind: chainKind as any,
      address,
      logoURI,
      slug,
      sources: ['admin-panel'],
    },
  });

  return NextResponse.json({ ok: true });
}
