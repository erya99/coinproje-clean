import { notFound } from 'next/navigation';
import Image from 'next/image';
import VoteButton from './vote-button';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function normalizeLogo(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('ipfs://')) return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  return url;
}

export default async function CoinDetail({ params }: { params: { slug: string } }) {
  const coin = await prisma.coin.findUnique({ where: { slug: params.slug } });
  if (!coin) return notFound();

  const logo = normalizeLogo(coin.logoURI);

  return (
    <div className="space-y-4">
      {/* ✅ beyaz değil, koyu temaya uygun kart */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="size-12 overflow-hidden rounded-full border border-border bg-muted">
          {logo ? (
            <Image src={logo} alt={coin.name} width={48} height={48} />
          ) : null}
        </div>
        <div>
          <div className="font-semibold">{coin.name}</div>
          <div className="text-xs text-muted-foreground">{coin.symbol}</div>
        </div>
      </div>

      <VoteButton coinId={coin.id} />
    </div>
  );
}
