import { prisma } from '../../../lib/prisma';
import VoteButton from './vote-button';

type Props = { params: { slug: string } };

export default async function CoinDetail({ params }: Props) {
  const coin = await prisma.coin.findUnique({ where: { slug: params.slug } });
  if (!coin) return <div className="text-sm text-red-600">Coin bulunamadı.</div>;

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border bg-white p-6 mb-4">
        <div className="flex items-center gap-3">
          {coin.logoURI ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coin.logoURI} alt={coin.symbol} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
              {coin.symbol.slice(0, 3)}
            </div>
          )}
          <div>
            <div className="text-xl font-semibold">{coin.name}</div>
            <div className="text-stone-500">{coin.symbol}</div>
          </div>
        </div>
      </div>

      <VoteButton coinId={coin.id} />
    </div>
  );
}
