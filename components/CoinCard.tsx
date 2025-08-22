// components/CoinCard.tsx
type Props = {
  href: string;
  logo?: string | null;
  name: string;
  symbol: string;
  votes?: number;
};

export default function CoinCard({ href, logo, name, symbol, votes }: Props) {
  return (
    <a
      href={href}
      className="rounded-2xl border bg-white hover:shadow-md transition-shadow p-4 flex items-center gap-3"
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={symbol} className="w-9 h-9 rounded-full" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-xs">
          {symbol.slice(0, 3)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{name}</div>
        <div className="text-xs text-stone-500">{symbol}</div>
      </div>

      {typeof votes === 'number' && (
        <div className="text-right">
          <div className="text-lg font-bold">{votes}</div>
          <div className="text-[11px] text-stone-500 -mt-0.5">oy</div>
        </div>
      )}
    </a>
  );
}
