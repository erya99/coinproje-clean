import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/ratelimit';

function todayYmdTR() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

export async function POST(req: NextRequest) {
  const { success } = await ratelimit.limit(req.ip ?? 'anonymous');
  if (!success) return NextResponse.json({ error: 'Çok hızlısın, birazdan tekrar dene.' }, { status: 429 });

  const body = await req.json();
  const coinId = String(body.coinId || '');
  if (!coinId) return NextResponse.json({ error: 'coinId gerekli' }, { status: 400 });

  const coin = await prisma.coin.findUnique({ where: { id: coinId } });
  if (!coin) return NextResponse.json({ error: 'Coin bulunamadı' }, { status: 404 });

  const ymd = todayYmdTR();
  const dv = await prisma.dailyVote.upsert({
    where: { coinId_dateYmd: { coinId, dateYmd: ymd } },
    update: { votes: { increment: 1 } },
    create: { coinId, dateYmd: ymd, votes: 1 }
  });
  return NextResponse.json({ ok: true, message: 'Oyun kaydedildi. Teşekkürler!' });
}