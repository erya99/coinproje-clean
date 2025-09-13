'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [pwd, setPwd] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    });
    if (res.ok) router.push('/admin');
    else alert('Wrong password');
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-lg font-semibold mb-3">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="w-full rounded border bg-background p-2"
          placeholder="Password"
        />
        <button className="rounded bg-primary px-4 py-2 text-black font-medium">Login</button>
      </form>
    </div>
  );
}
