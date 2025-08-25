import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/admin/coins" className="rounded-xl border bg-card p-4 hover:bg-muted">➕ Add / Manage Coins</Link>
        <Link href="/admin/requests" className="rounded-xl border bg-card p-4 hover:bg-muted">📥 User Requests</Link>
      </div>
    </div>
  );
}
