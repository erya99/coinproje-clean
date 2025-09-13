'use client';
import { useRouter } from 'next/navigation';

export default function DeleteCoinButton({ id }: { id: string }) {
  const router = useRouter();
  async function del() {
    if (!confirm('Delete this coin?')) return;
    const res = await fetch(`/api/admin/coins/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert('Delete failed');
    }
  }
  return (
    <button onClick={del} className="underline text-red-500">
      Delete
    </button>
  );
}
