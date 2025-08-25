export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';
import slugify from '@sindresorhus/slugify';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  // cookie'den token al
  const cookie = (req.headers.get('cookie') ?? '')
    .split(';').map(s => s.trim()).find(s => s.startsWith('admin_token='));
  const token = cookie ? decodeURIComponent(cookie.split('=')[1]) : null;

  // TS uyarısı olmaması için null geçiyoruz
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const name = String(form.get('name') || '').trim();
  const symbol = String(form.get('symbol') || '').trim().toUpperCase();
  const chainKind = String(form.get('chainKind') || '').trim();
  const address = String(form.get('address') || '').trim() || null;
  const file = form.get('logo') as File | null;

  if (!name || !symbol || !chainKind) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  // logo kaydet (opsiyonel)
  let logoURI: string | null = null;
  if (file && file.size > 0) {
    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const ext = (file.type.includes('png') ? 'png' :
                file.type.includes('jpeg') ? 'jpg' :
                path.extname(file.name).replace('.', '') || 'png');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    logoURI = `/uploads/${filename}`;
  }

  // benzersiz slug
  const base = `${symbol}-${name}-${chainKind}`;
  let slug = slugify(base, { lowercase: true });
  for (let i = 1; i < 50; i++) {
    const exists = await prisma.coin.findUnique({ where: { slug } });
    if (!exists) break;
    slug = slugify(`${base}-${i}`, { lowercase: true });
  }

  await prisma.coin.create({
    data: {
      name, symbol, chainKind: chainKind as any, address, slug,
      logoURI, sources: ['admin'],
    },
  });

  return NextResponse.json({ ok: true });
}
