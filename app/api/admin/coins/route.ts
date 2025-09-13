import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const coins = await prisma.coin.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coins);
}

export async function POST(req: Request) {
  const data = await req.json();
  // data: CoinInput ile uyumlu (chainKind enumuna dikkat)
  const coin = await prisma.coin.create({ data });
  return NextResponse.json(coin);
}
