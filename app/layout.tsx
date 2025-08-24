import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import ThemeToggle from '@/components/theme-toggle';
import { ThemeProvider } from '@/components/theme-provider';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ShillVote — Günün En Çok Oylanan Coinleri',
  description:
    'Kullanıcı oylamasıyla sıralanan coin listesi. Finansal tavsiye değildir.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="border-b border-border/70 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="container flex h-14 items-center justify-between gap-4">
              <Link href="/" className="font-semibold tracking-tight">
                <span className="text-primary">Shill</span>Vote
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/coins"
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition"
                >
                  Coinler
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="container py-6">{children}</main>

          <footer className="container py-10 text-xs text-muted-foreground">
            © {new Date().getFullYear()} ShillVote — finansal tavsiye değildir.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
