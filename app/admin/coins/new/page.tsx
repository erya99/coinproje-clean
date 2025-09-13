import CoinForm from '@/components/admin/CoinForm';

export default function NewCoinPage() {
  async function createCoin(data: any) {
    'use server';
    await fetch('/api/admin/coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold mb-4">Add New Coin</h1>
      <CoinForm onSubmit={createCoin} />
    </main>
  );
}
