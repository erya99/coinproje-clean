// app/admin/api/coins/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import path from 'path';
import { promises as fs } from 'fs';
import slugify from '@sindresorhus/slugify';
import { prisma } from '@/lib/prisma'; // kendi prisma helper'ınız

export async function POST(req: NextRequest) {
  // auth
  const token = req.cookies.get('admin_token')?.value;
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

  let logoURI: string | null = null;

  if (file && file.size > 0) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'coins');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = file.name?.split('.').pop()?.toLowerCase() || 'png';
    const base = slugify(`${symbol}-${name}`.toLowerCase());
    const filename = `${base}-${Date.now()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buf);
    logoURI = `/uploads/coins/${filename}`;
  }

  const slug = slugify(`${symbol}-${chainKind}`.toLowerCase());
  const data = await prisma.coin.create({
    data: {
      name,
      symbol,
      chainKind: chainKind as any,
      address,
      slug,
      logoURI,
      sources: [],
    },
  });

  return NextResponse.json({ ok: true, data });
}
