// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';
import ThemeToggle from '@/components/theme-toggle';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'ShillVote — Today’s Most Voted Coins',
  description: 'Coin ranking based on user votes. Not financial advice.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <Script
          id="adsense-script"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8264540196990511"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider>
          <header className="border-b border-border/70 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="container flex h-14 items-center justify-between gap-4">
              <Link href="/" prefetch={false} className="font-semibold tracking-tight">
                <span className="text-primary">Shill</span>Vote
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/coins"
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition"
                >
                  Coins
                </Link>
                <Link
                  href="/submit"
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition"
                >
                  Submit
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="container py-6">{children}</main>

          {/* Yeni footer */}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
