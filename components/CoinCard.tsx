import Image from 'next/image';
import Link from 'next/link';

type Props = {
  href: string;
  logo?: string | null;
  name: string;
  symbol: string;
  votes?: number; // opsiyonel: /coins sayfasında göstermeyebiliriz
};

function normalizeLogo(url?: string | null) {
  if (!url) return null;
  // ipfs://... -> https://ipfs.io/ipfs/...
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
}

export default function CoinCard({ href, logo, name, symbol, votes }: Props) {
  const src = normalizeLogo(logo);

  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 overflow-hidden rounded-full border border-border bg-muted shrink-0">
          {src ? (
            <Image src={src} alt={name} width={40} height={40} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {symbol?.slice(0, 3)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{symbol}</div>
        </div>

        {typeof votes === 'number' && (
          <div className="ml-auto rounded-lg bg-primary/15 px-2 py-1 text-xs text-primary">
            {votes.toLocaleString('tr-TR')} oy
          </div>
        )}
      </div>
    </Link>
  );
}
