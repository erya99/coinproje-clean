import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma, ChainKind } from '@prisma/client';

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(base: string) {
  let s = base || 'coin';
  let i = 1;
  // aynı slug varsa -1, -2 diye sonuna ekle
  while (await prisma.coin.findUnique({ where: { slug: s } })) {
    s = `${base}-${i++}`;
  }
  return s;
}

function pickBody(body: any) {
  const name = String(body?.name ?? '').trim();
  const symbol = String(body?.symbol ?? '').trim();
  const chainKind = body?.chainKind as ChainKind;
  const chainId =
    body?.chainId === '' || body?.chainId === undefined ? null : Number(body.chainId);
  // 🎯 ÖNEMLİ: adresi olduğu gibi koruyoruz (checksum/case bozulmasın)
  let address = body?.address;
  if (typeof address === 'string') {
    address = address.trim();
    if (address === '') address = null;
  } else {
    address = null;
  }
  const logoURI = body?.logoURI ? String(body.logoURI) : null;

  return { name, symbol, chainKind, chainId, address, logoURI };
}

export async function GET() {
  const coins = await prisma.coin.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coins);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = pickBody(body);

    // case-insensitive duplicate kontrolü (ör. EVM’de aynı adres farklı checksum ile gelirse yakala)
    if (data.address) {
      const dup = await prisma.coin.findFirst({
        where: {
          chainKind: data.chainKind,
          address: { equals: data.address, mode: 'insensitive' }, // Postgres'te ILIKE
        },
        select: { id: true, name: true, symbol: true, slug: true },
      });
      if (dup) {
        return NextResponse.json(
          {
            error:
              'Duplicate: Bu chain için aynı adres daha önce eklenmiş (case-insensitive kontrol).',
            existing: dup,
          },
          { status: 409 }
        );
      }
    }

    // slug otomatik üret
    const base = slugify(data.name || data.symbol || 'coin');
    const slug = await ensureUniqueSlug(base);

    const created = await prisma.coin.create({
      data: { ...data, slug },
    });
    return NextResponse.json(created);
  } catch (err: any) {
    // DB tarafındaki benzersiz alan hataları (örn. slug uniq) yine 409 döner
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate: benzersiz alan çakışması (slug veya chain+address).' },
        { status: 409 }
      );
    }
    console.error('POST /api/admin/coins', err);
    return NextResponse.json({ error: 'POST failed' }, { status: 500 });
  }
}
