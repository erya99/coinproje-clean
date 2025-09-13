import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Sadece şemadaki alanları kabul et
function pickCoinData(body: any) {
  return {
    name: body?.name as string,
    symbol: body?.symbol as string,
    slug: body?.slug as string,
    chainKind: body?.chainKind,         // enum string (örn. "BSC")
    chainId: body?.chainId ?? null,     // number | null
    address: body?.address || null,     // string | null
    logoURI: body?.logoURI || null,     // string | null (dosya upload sonrası URL)
    // sources şemada var ama zorunlu değil -> otomatik []
  };
}

export async function GET() {
  const coins = await prisma.coin.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coins);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = pickCoinData(body);
  const created = await prisma.coin.create({ data });
  return NextResponse.json(created);
}
