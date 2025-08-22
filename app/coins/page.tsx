import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import type { Coin, Prisma } from '@prisma/client';
import CoinCard from '../../components/CoinCard';

type Props = { searchParams: { q?: string } };

export default async function CoinsPage({ searchParams }: Props) {
  const q = (searchParams?.q || '').trim();

  const where: Prisma.CoinWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { symbol: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const items: Coin[] = await prisma.coin.findMany({
    where,
    orderBy: [{ name: 'asc' }],
    take: 500,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tüm Coinler</h1>
        <Link href="/" className="text-sm text-stone-600 hover:underline">Bugünün oyları</Link>
      </div>

      <form>
        <input
          name="q"
          defaultValue={q}
          placeholder="Ara: name, symbol, address"
          className="w-full rounded-xl border p-2 mb-4 bg-white"
        />
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <CoinCard
            key={c.id}
            href={`/coin/${c.slug}`}
            logo={c.logoURI}
            name={c.name}
            symbol={c.symbol}
          />
        ))}
      </div>
    </>
  );
}
