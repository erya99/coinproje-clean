// app/api/admin/coins/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma, ChainKind } from '@prisma/client';

type Params = { params: { id: string } };

function pickBody(body: any) {
  const name =
    body?.name !== undefined ? String(body.name).trim() : undefined;
  const symbol =
    body?.symbol !== undefined ? String(body.symbol).trim() : undefined;
  const slug =
    body?.slug !== undefined ? String(body.slug).trim() : undefined;
  const chainKind =
    body?.chainKind as ChainKind | undefined;
  const chainId =
    body?.chainId === '' || body?.chainId === undefined
      ? undefined
      : Number(body.chainId);

  // 🎯 Adresi OLDUĞU GİBİ koru (checksum / case bozulmasın)
  let address: string | null | undefined = undefined;
  if ('address' in body) {
    if (typeof body.address === 'string') {
      const a = body.address.trim();
      address = a === '' ? null : a; // boş string -> NULL
    } else {
      address = null;
    }
  }

  const logoURI =
    body?.logoURI === undefined
      ? undefined
      : body.logoURI
      ? String(body.logoURI)
      : null;

  return { name, symbol, slug, chainKind, chainId, address, logoURI };
}

export async function GET(_: Request, { params }: Params) {
  const coin = await prisma.coin.findUnique({ where: { id: params.id } });
  return NextResponse.json(coin);
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const raw = pickBody(body);

    // Kısmi update objesi oluştur
    const data: any = {};
    for (const k in raw) if ((raw as any)[k] !== undefined) data[k] = (raw as any)[k];

    // Eğer address güncelleniyorsa -> case-insensitive duplicate kontrolü
    if ('address' in data) {
      const chainKind = (data.chainKind ?? body.chainKind) as ChainKind | undefined;

      if (data.address && chainKind) {
        const dup = await prisma.coin.findFirst({
          where: {
            id: { not: params.id },
            chainKind: chainKind,
            address: { equals: data.address, mode: 'insensitive' },
          },
          select: { id: true, name: true, symbol: true, slug: true },
        });
        if (dup) {
          return NextResponse.json(
            {
              error:
                'Duplicate: Bu chain için aynı adres mevcut (case-insensitive kontrol).',
              existing: dup,
            },
            { status: 409 }
          );
        }
      }
    }

    const updated = await prisma.coin.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate: benzersiz alan çakışması (ör. slug).' },
        { status: 409 }
      );
    }
    console.error('PUT /api/admin/coins/[id]', err);
    return NextResponse.json({ error: 'PUT failed' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await prisma.coin.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/coins/[id]', err);
    return NextResponse.json({ error: 'DELETE failed' }, { status: 500 });
  }
}
