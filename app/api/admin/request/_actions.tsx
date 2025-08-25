'use client';

import { CoinRequest } from '@prisma/client';

export default function AdminRequestsActions({ id, req }: { id: string; req: CoinRequest }) {
  async function act(path: 'approve' | 'reject') {
    const res = await fetch(`/api/admin/requests/${id}/${path}`, { method: 'POST' });
    const j = await res.json();
    if (j.ok) location.reload();
    else alert(j.error || 'Error');
  }

  return (
    <div className="flex gap-2">
      {req.status === 'PENDING' && (
        <>
          <button onClick={() => act('approve')} className="rounded bg-green-600 text-white px-3 py-1">Approve</button>
          <button onClick={() => act('reject')} className="rounded bg-red-600 text-white px-3 py-1">Reject</button>
        </>
      )}
    </div>
  );
}
