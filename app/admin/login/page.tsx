'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginFormInner() {
  const sp = useSearchParams();
  const error = sp.get('error') ?? '';
  const next = sp.get('next') ?? '/admin/coins';

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">Admin Login</h1>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* next paramını koru */}
      <form method="post" action={`/admin/api/login?next=${encodeURIComponent(next)}`} className="space-y-3">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none"
          required
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none"
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-3 py-2 text-white hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm">Loading…</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
