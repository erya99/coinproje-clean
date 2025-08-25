import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { ChainBadge } from '@/lib/chain-badge';
import { CHAINS } from '@/lib/chains';

export const dynamic = 'force-dynamic';

function todayYmdTR() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeLogo(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('ipfs://')) return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  return url;
}

type PageProps = { searchParams?: { q?: string } };

export default async function CoinsPage({ searchParams }: PageProps) {
  const q = (searchParams?.q ?? '').trim();

  const where: Prisma.CoinWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { symbol: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const items = await prisma.coin.findMany({
    where,
    orderBy: [{ name: 'asc' }],
    take: 500,
  });

  // Bugünün oyları (kartın sağ üstündeki yeşil rozet)
  const ymd = todayYmdTR();
  const todays = await prisma.dailyVote.findMany({
    where: { dateYmd: ymd, coinId: { in: items.map((c) => c.id) } },
    select: { coinId: true, votes: true },
  });
  const votesMap = new Map<string, number>();
  todays.forEach((v) => votesMap.set(v.coinId, v.votes));

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">All Coins</h1>
      <p className="mb-4 text-sm text-muted-foreground">Today’s votes</p>

      <form className="mb-4" action="/coins">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search: name, symbol, address"
          className="w-full rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
        />
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => {
          const src = normalizeLogo(c.logoURI);
          const votes = votesMap.get(c.id) ?? 0;
          const chainLabel =
            CHAINS[c.chainKind as keyof typeof CHAINS]?.label ?? String(c.chainKind);

          return (
            <Link
              key={c.id}
              href={`/coin/${c.slug}`}
              className="group relative rounded-xl border border-border bg-card p-4 transition hover:bg-muted"
            >
              {/* sağ üst: votes + chain badge */}
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <span className="rounded-full border border-emerald-600/30 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                  {votes} votes
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground bg-card/70">
                  <ChainBadge kind={c.chainKind as any} />
                  <span className="leading-none">{chainLabel}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  {src ? (
                    <Image src={src} alt={c.name} width={40} height={40} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      {c.symbol?.slice(0, 3)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.symbol}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
