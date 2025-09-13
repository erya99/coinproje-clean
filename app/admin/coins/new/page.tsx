'use client';
import CoinForm from '@/components/admin/CoinForm';

export default function NewCoinPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold mb-4">Add New Coin</h1>
      <CoinForm mode="create" />
    </main>
  );
}
