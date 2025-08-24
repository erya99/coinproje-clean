import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
// varsa hız limiti kullanıyorsan aç:
// import { ratelimit } from '@/lib/ratelimit';

function todayYmdTR() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function POST(req: NextRequest) {
  try {
    // hız limiti kullanıyorsan:
    // const { success } = await ratelimit.limit(req.ip ?? 'anon');
    // if (!success) return NextResponse.json({ error: 'Çok hızlısın' }, { status: 429 });

    const { coinId } = await req.json();
    if (!coinId) return NextResponse.json({ error: 'coinId gerekli' }, { status: 400 });

    const coin = await prisma.coin.findUnique({ where: { id: coinId } });
    if (!coin) return NextResponse.json({ error: 'Coin bulunamadı' }, { status: 404 });

    const ymd = todayYmdTR();

    await prisma.dailyVote.upsert({
      where: { coinId_dateYmd: { coinId, dateYmd: ymd } },
      update: { votes: { increment: 1 } },
      create: { coinId, dateYmd: ymd, votes: 1 },
    });

    // ✅ oy sonrası sayfaları anında tazele
    revalidatePath('/');
    revalidatePath('/coins');
    revalidatePath(`/coin/${coin.slug}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
