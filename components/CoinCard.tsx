'use client';

import Link from 'next/link';
import { useState, ImgHTMLAttributes } from 'react';
import { ChainKind } from '@prisma/client';
import { ChainBadge } from '@/lib/chain-badge';

// Küçük bir inline PNG placeholder (gri daire) – dosya koymana gerek yok
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stop-color="#d9d9d9"/>
          <stop offset="1" stop-color="#efefef"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#g)"/>
    </svg>`
  );

type Coin = {
  slug: string;
  name: string;
  symbol: string;
  logoURI?: string | null;
  chainKind: ChainKind;
};

function SafeImg(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [src, setSrc] = useState(props.src || PLACEHOLDER);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={src}
      onError={() => setSrc(PLACEHOLDER)}
      loading="lazy"
      alt={props.alt}
    />
  );
}

export function CoinCard({ coin }: { coin: Coin }) {
  return (
    <Link
      href={`/coin/${coin.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 transition hover:border-primary/50 hover:bg-card"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60">
        <SafeImg
          alt={`${coin.name} logo`}
          src={coin.logoURI || undefined}
          width={40}
          height={40}
          className="h-10 w-10 object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{coin.name}</p>
          <span className="text-xs text-muted-foreground">{coin.symbol}</span>
        </div>
        <div className="mt-1">
          <ChainBadge kind={coin.chainKind} />
        </div>
      </div>
    </Link>
  );
}

export default CoinCard;
