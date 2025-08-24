import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import VoteButton from './vote-button';
import AdUnit from '@/components/AdUnit';

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

type PageProps = { params: { slug: string } };

export default async function CoinDetailPage({ params }: PageProps) {
  const { slug } = params;

  const coin = await prisma.coin.findUnique({
    where: { slug },
  });

  if (!coin) return notFound();

  // bugünün oy sayısını gösterelim (0 olabilir)
  const ymd = todayYmdTR();
  const dv = await prisma.dailyVote.findFirst({
    where: { coinId: coin.id, dateYmd: ymd },
  });
  const votesToday = dv?.votes ?? 0;

  const logo = normalizeLogo(coin.logoURI);

  return (
    <>
      <div className="mb-6">
        <Link href="/coins" className="text-sm text-muted-foreground hover:underline">
          ← All coins
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-12 overflow-hidden rounded-full border border-border bg-muted shrink-0">
            {logo ? (
              <Image src={logo} alt={coin.name} width={48} height={48} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {coin.symbol?.slice(0, 3)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{coin.name}</div>
            <div className="text-xs text-muted-foreground">{coin.symbol}</div>
          </div>

          <div className="ml-auto rounded-lg bg-primary/15 px-2 py-1 text-xs text-primary">
            Today: {votesToday.toLocaleString('tr-TR')} votes
          </div>
        </div>
      </div>

      {/* Oy butonu */}
      <VoteButton coinId={coin.id} />
      <AdUnit slot="7224318004" className="mt-6" collapseIfEmpty />

      <p className="mt-8 text-xs text-muted-foreground">
      </p>
    </>
  );
}
