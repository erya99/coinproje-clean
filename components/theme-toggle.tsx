'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== 'light';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted transition"
      aria-label="Tema değiştir"
    >
      {isDark ? <Sun size={16}/> : <Moon size={16}/>}
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
