// app/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import CoinCard from '@/components/CoinCard';

export const dynamic = 'force-dynamic';

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
      <h1 className="mb-2 text-2xl font-bold">Today’s Most Voted Coins</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Not financial advice. Votes reflect user opinions.
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No votes yet.{' '}
          <Link className="underline" href="/coins">
            You can go to the coin list
          </Link>{' '}
          and cast your vote.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <li key={it.id}>
              {/* Kartı relative bir kapsayıcıya alıp sağ-üst badge’i üstüne oturtuyoruz */}
              <div className="relative">
                <CoinCard coin={it.coin} />

                {/* Sağ üstte yeşil votes rozeti (tüm sayfalarda kullandığın stile uyumlu) */}
                <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-400">
                  {it.votes} votes
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
