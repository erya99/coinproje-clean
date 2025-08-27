// PATH: app/coins/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { ChainBadge } from '@/lib/chain-badge';

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

  // Bugünün oylarını kartlarda göstermek için
  const ymd = todayYmdTR();
  const ids = items.map((c) => c.id);

  const todaysVotes = ids.length
    ? await prisma.dailyVote.findMany({
        where: { dateYmd: ymd, coinId: { in: ids as any } }, // id tipi projeye göre değişebildiği için any güvenli
        select: { coinId: true, votes: true },
      })
    : [];

  // A) coinId Prisma’dan string gelebiliyor → string key kullan
  const votesByCoin = new Map<string, number>();
  todaysVotes.forEach((r) => votesByCoin.set(String(r.coinId), r.votes));

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">All Coins</h1>
      <p className="text-sm text-muted-foreground mb-4">Today’s votes</p>

      {/* Arama kutusu */}
      <form className="mb-4" action="/coins">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search: name, symbol, address"
          className="w-full rounded-xl border border-border bg-card text-foreground
                     placeholder:text-muted-foreground px-4 py-3 outline-none
                     focus:ring-2 focus:ring-primary/40"
        />
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => {
          const src = normalizeLogo(c.logoURI);
          const count = votesByCoin.get(String(c.id)) ?? 0;

          return (
            <Link
              key={c.id}
              href={`/coin/${c.slug}`}
              className="group rounded-xl border border-border bg-card p-4 hover:bg-muted transition"
            >
              {/* Üst satır: logo + isim */}
              <div className="flex items-center gap-3">
                <div className="size-10 overflow-hidden rounded-full border border-border bg-muted shrink-0">
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

              {/* Alt bölüm: zincir (tek rozet) + ALTINDA yeşil oy rozeti */}
              <div className="mt-3 flex flex-col items-start gap-2">
                <ChainBadge kind={c.chainKind as any} />
                <span className="rounded-full bg-emerald-500/15 text-emerald-400 text-xs px-2 py-1">
                  {count} votes
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
