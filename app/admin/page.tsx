import Link from 'next/link';

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/coins" className="rounded-xl border p-4 hover:bg-muted/40">
          <div className="font-semibold mb-1">Manage Coins</div>
          <div className="text-sm text-muted-foreground">List, edit, delete, add new</div>
        </Link>
        <Link href="/admin/coins/new" className="rounded-xl border p-4 hover:bg-muted/40">
          <div className="font-semibold mb-1">Add New Coin</div>
          <div className="text-sm text-muted-foreground">Create coin manually</div>
        </Link>
      </div>
    </main>
  );
}
