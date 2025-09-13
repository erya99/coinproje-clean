import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VoteButton from './vote-button';
import AAdsBanner from '@/components/Ads/AAdsBanner';
import type { ChainKind } from '@prisma/client';

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

// explorer URL'leri ChainKind'a göre
function explorerUrl(kind: ChainKind, addr?: string | null) {
  if (!addr) return null;
  const map: Partial<Record<ChainKind, string>> = {
    ETHEREUM: `https://etherscan.io/token/${addr}`,
    BSC:      `https://bscscan.com/token/${addr}`,
    POLYGON:  `https://polygonscan.com/token/${addr}`,
    AVALANCHE:`https://snowtrace.io/token/${addr}`,
    ARBITRUM: `https://arbiscan.io/token/${addr}`,
    OPTIMISM: `https://optimistic.etherscan.io/token/${addr}`,
    BASE:     `https://basescan.org/token/${addr}`,
    FANTOM:   `https://ftmscan.com/token/${addr}`,
    GNOSIS:   `https://gnosisscan.io/token/${addr}`,
    CRONOS:   `https://cronoscan.com/token/${addr}`,
    SOLANA:   `https://solscan.io/token/${addr}`,
    TRON:     `https://tronscan.org/#/token20/${addr}`,
    TON:      `https://tonscan.org/address/${addr}`,
    NEAR:     `https://nearblocks.io/address/${addr}`,
    COSMOS:   `https://www.mintscan.io/search?q=${addr}`,
    SUI:      `https://suiexplorer.com/object/${addr}`,
    APTOS:    `https://explorer.aptoslabs.com/account/${addr}`,
    STARKNET: `https://starkscan.co/contract/${addr}`,
    BITCOIN:  `https://mempool.space/address/${addr}`,
    DOGE:     `https://dogechain.info/address/${addr}`,
    LITECOIN: `https://litecoinspace.org/address/${addr}`,
    NATIVE:   undefined,
    OTHER:    undefined,
  };
  return map[kind] ?? null;
}

type PageProps = { params: { slug: string } };

export default async function CoinDetailPage({ params }: PageProps) {
  const { slug } = params;

  const coin = await prisma.coin.findUnique({ where: { slug } });
  if (!coin) return notFound();

  const ymd = todayYmdTR();
  const dv = await prisma.dailyVote.findFirst({
    where: { coinId: coin.id, dateYmd: ymd },
  });
  const votesToday = dv?.votes ?? 0;

  const logo = normalizeLogo(coin.logoURI);
  const exp = explorerUrl(coin.chainKind, coin.address);

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

            {/* Contract (address) + copy + explorer */}
            {coin.address && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Contract:</span>
                <code className="px-2 py-0.5 rounded bg-muted/40">
                  {coin.address.slice(0, 6)}…{coin.address.slice(-4)}
                </code>
                <button
                  className="underline hover:no-underline"
                  onClick={async () => navigator.clipboard.writeText(coin.address!)}
                >
                  Copy
                </button>
                {exp && (
                  <Link href={exp} target="_blank" className="underline hover:no-underline">
                    View on Explorer
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto rounded-lg bg-primary/15 px-2 py-1 text-xs text-primary">
            Today: {votesToday.toLocaleString('tr-TR')} votes
          </div>
        </div>
      </div>

      {/* Vote butonu */}
      <VoteButton coinId={coin.id} />

      {/* Reklam: Vote butonunun hemen altı */}
      <div className="mt-6">
        <AAdsBanner unitId="2408771" />
      </div>
    </>
  );
}
