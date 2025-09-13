// app/admin/requests/_actions.tsx
'use client';

export default function RequestActions({ id }: { id: string }) {
  async function act(path: 'approve' | 'reject') {
    const res = await fetch(`/api/admin/requests/${id}/${path}`, { method: 'POST' });
    if (!res.ok) {
      const t = await res.text();
      alert(`Action failed: ${t}`);
    } else {
      location.reload();
    }
  }

  return (
    <div className="space-x-2">
      <button
        onClick={() => act('approve')}
        className="rounded bg-green-600 text-white px-3 py-1"
      >
        Approve
      </button>
      <button
        onClick={() => act('reject')}
        className="rounded bg-red-600 text-white px-3 py-1"
      >
        Reject
      </button>
    </div>
  );
}
