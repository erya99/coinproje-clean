import { absUrl } from '@/lib/abs-url';
import CoinForm from '@/components/admin/CoinForm';

type Props = { params: { id: string } };

export default async function EditCoinPage({ params }: Props) {
  const res = await fetch(absUrl(`/api/admin/coins/${params.id}`), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load coin');
  const coin = await res.json();
  return <CoinForm initial={coin} id={coin.id} mode="edit" />;
}
