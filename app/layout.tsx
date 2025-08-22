import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ShillVote — Günün En Çok Oylanan Coinleri',
  description:
    'Kullanıcı oylamasıyla sıralanan coin listesi. Finansal tavsiye değildir.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
          <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold tracking-tight">ShillVote</a>
            <div className="flex items-center gap-4 text-sm">
              <a href="/coins" className="hover:underline">Tüm Coinler</a>
              <a
                href="https://github.com/"
                target="_blank"
                className="text-stone-500 hover:text-stone-700"
              >
                GitHub
              </a>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-stone-500">
            © {new Date().getFullYear()} ShillVote — Finansal tavsiye değildir.
          </div>
        </footer>
      </body>
    </html>
  );
}
