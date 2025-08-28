'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SiteFooter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    // Burada gerçek bir servis (Beehiiv, Mailchimp, Buttondown vs.) entegre edebilirsiniz.
    // Şimdilik sadece basit bir "sent" durumu gösteriyoruz.
    setSent(true);
    setEmail('');
  }

  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="container py-10">
        {/* Üst grid */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand / kısa açıklama */}
          <div className="space-y-3">
            <Link href="/" prefetch={false} className="inline-block text-xl font-semibold">
              <span className="text-primary">Shill</span>Vote
            </Link>
            <p className="text-sm text-muted-foreground">
              ShillVote is a simple and fast crypto voting/discovery platform that highlights projects
              through community votes. It is not financial advice.
            </p>
          </div>

          {/* Ranking */}
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">Ranking</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" prefetch={false} className="hover:underline">Today’s Most Voted</Link></li>
              <li><Link href="/coins" prefetch={false} className="hover:underline">All Coins</Link></li>
              <li><Link href="/submit" prefetch={false} className="hover:underline">Suggest a Coin</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/coins?q=bsc" prefetch={false} className="hover:underline">BSC Coins</Link></li>
              <li><Link href="/coins?q=eth" prefetch={false} className="hover:underline">Ethereum Coins</Link></li>
              <li><Link href="/coins" prefetch={false} className="hover:underline">New Listings</Link></li>
            </ul>
          </div>

          {/* Company / Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/disclaimer" prefetch={false} className="hover:underline">Disclaimer</Link></li>
              <li><Link href="/legal/terms" prefetch={false} className="hover:underline">Terms of Use</Link></li>
              <li><Link href="/legal/privacy" prefetch={false} className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/legal/contact" prefetch={false} className="hover:underline">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter stripe */}
        <div className="mt-10 rounded-xl border border-border/70 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h4 className="text-base font-semibold">Stay up to date</h4>
              <p className="text-sm text-muted-foreground">
                Yeni eklenen coinler ve platform güncellemeleri için e-posta adresini bırak.
              </p>
            </div>
            <form onSubmit={onSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none
                           focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                {sent ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShillVote — not financial advice. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
