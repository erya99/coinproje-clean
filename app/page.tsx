// app/page.tsx
export const dynamic = 'force-dynamic'; // cache kapat: her istekte SSR

import { prisma } from '../lib/prisma';
import type { Prisma } from '@prisma/client';
import CoinCard from '../components/CoinCard';

function todayYmdTR() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type VoteWithCoin = Prisma.DailyVoteGetPayload<{ include: { coin: true } }>;

export default async function Home() {
  const ymd = todayYmdTR();
  const items: VoteWithCoin[] = await prisma.dailyVote.findMany({
    where: { dateYmd: ymd },
    include: { coin: true },
    orderBy: { votes: 'desc' },
    take: 100,
  });

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Bugünün En Çok Oylanan Coinleri</h1>
      <p className="text-sm text-stone-600 mb-6">
        Finansal tavsiye değildir. Oylar kullanıcı görüşüdür.
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-stone-600">
          Henüz oy yok. <a className="underline" href="/coins">Coin listesine</a> gidip oy verebilirsin.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <CoinCard
              key={it.id}
              href={`/coin/${it.coin.slug}`}
              logo={it.coin.logoURI}
              name={it.coin.name}
              symbol={it.coin.symbol}
              votes={it.votes}
            />
          ))}
        </div>
      )}
    </>
  );
}
