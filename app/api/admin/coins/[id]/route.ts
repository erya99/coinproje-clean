import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const coin = await prisma.coin.findUnique({ where: { id: params.id } });
  return NextResponse.json(coin);
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json();
  const coin = await prisma.coin.update({ where: { id: params.id }, data: body });
  return NextResponse.json(coin);
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.coin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
