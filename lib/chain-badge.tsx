'use client';

import { ChainKind } from '@prisma/client';

function CircleIcon({ bg, fg, path }: { bg: string; fg: string; path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="12" fill={bg} />
      <path d={path} fill={fg} />
    </svg>
  );
}

// Basit ikon path’leri (minik, hafif)
const ICONS: Partial<Record<ChainKind, JSX.Element>> = {
  ETHEREUM: (
    <svg viewBox="0 0 256 417" width="16" height="16" aria-hidden>
      <path fill="#627EEA" d="M127.9 0l-1 27.6v250.7l1 .9 127.8-75.5z" />
      <path fill="#627EEA" opacity=".6" d="M127.9 0L0 203.7l127.9 75.5V0z" />
      <path fill="#627EEA" d="M128 314.1l-.6.7v101.4l.6 1.8 127.9-180z" />
      <path fill="#627EEA" opacity=".6" d="M128 417V314.1L0 237.9z" />
      <path fill="#627EEA" opacity=".2" d="M128 279.2l127.9-75.5L128 128.7z" />
      <path fill="#627EEA" opacity=".6" d="M0 203.7l128 75.5V128.7z" />
    </svg>
  ),
  BSC: (
    <CircleIcon
      bg="#F3BA2F"
      fg="#111827"
      path="M12 6l2.6 2.6L12 11.2 9.4 8.6 12 6zm5.4 5.4L20 12l-2.6 2.6L15 12l2.4-.6zM6 12l2.6-2.6L11 12l-2.4 2.6L6 12zm6 1.8l2.6 2.6L12 19l-2.6-2.6L12 13.8z"
    />
  ),
  POLYGON: (
    <CircleIcon
      bg="#8247E5"
      fg="#fff"
      path="M8.8 10.2l3.2-1.8 3.2 1.8v3.6l-3.2 1.8-3.2-1.8v-3.6zm-3.6 2.1l3.2 1.8v3.6l-3.2 1.8-3.2-1.8v-3.6l3.2-1.8zm14 0l3.2 1.8v3.6l-3.2 1.8-3.2-1.8v-3.6l3.2-1.8z"
    />
  ),
  ARBITRUM: (
    <CircleIcon
      bg="#2D3748"
      fg="#60A5FA"
      path="M7 7h10l-1 10-4 4-4-4-1-10z"
    />
  ),
  BASE: <CircleIcon bg="#0052FF" fg="#fff" path="M5 12a7 7 0 1014 0H5z" />,
  SOLANA: (
    <CircleIcon
      bg="#000"
      fg="#22D3EE"
      path="M7 8h10l-2 2H5l2-2zm0 6h10l-2 2H5l2-2zm2-3h10l-2 2H7l2-2z"
    />
  ),
  AVALANCHE: (
    <CircleIcon
      bg="#E84142"
      fg="#fff"
      path="M12 5l5 9-2 3H9l-2-3 5-9zm0 14l2-3H10l2 3z"
    />
  ),
  OPTIMISM: <CircleIcon bg="#FF0420" fg="#fff" path="M6 12a6 6 0 1012 0A6 6 0 006 12z" />,
  TRON: (
    <CircleIcon
      bg="#D40027"
      fg="#fff"
      path="M6 7l12 2-6 8L6 7zm2 2l4 6 3-4-7-2z"
    />
  ),
  BITCOIN: <CircleIcon bg="#F7931A" fg="#fff" path="M12 6a6 6 0 100 12 6 6 0 000-12z" />,
};

function FallbackBadge({ kind }: { kind: ChainKind }) {
  const label = kind.replace('_', ' ').toLowerCase();
  const letter = kind.slice(0, 1);
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-1 text-[11px] leading-none text-muted-foreground">
      {/* küçük harfli rozet */}
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-secondary/70 text-[10px] font-bold text-foreground/80">
        {letter}
      </span>
      {label}
    </span>
  );
}

export function ChainBadge({ kind }: { kind: ChainKind }) {
  const icon = ICONS[kind];
  const label = kind.replace('_', ' ').toLowerCase();

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-[3px] text-[11px] leading-none text-muted-foreground">
      <span className="inline-flex h-4 w-4 items-center justify-center">
        {icon ?? <FallbackBadge kind={kind} />}
      </span>
      <span className="capitalize">{label}</span>
    </span>
  );
}
