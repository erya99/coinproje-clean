import Image from 'next/image';
import Link from 'next/link';

type Props = {
  href: string;
  logo?: string | null;
  name: string;
  symbol: string;
  votes: number;
};

export default function CoinCard({ href, logo, name, symbol, votes }: Props) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 overflow-hidden rounded-full border border-border bg-muted">
          {logo ? (
            <Image src={logo} alt={name} width={40} height={40} />
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="truncate font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{symbol}</div>
        </div>

        <div className="ml-auto rounded-lg bg-primary/15 px-2 py-1 text-xs text-primary">
          {votes.toLocaleString('tr-TR')} oy
        </div>
      </div>
    </Link>
  );
}
