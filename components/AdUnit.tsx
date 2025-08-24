// app/components/AdUnit.tsx
"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type AdUnitProps = {
  adSlot: string;                        // ör: "7224318004"
  className?: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  fullWidthResponsive?: boolean;
  /** Reklamın yüklenmesi için bekleme süresi (ms). Süre dolarsa gizle. */
  timeoutMs?: number;
  /** Test sırasında beyaz blok görmemek için küçük koyu placeholder göstermek istersen */
  showPlaceholder?: boolean;
};

export default function AdUnit({
  adSlot,
  className,
  format = "auto",
  fullWidthResponsive = true,
  timeoutMs = 2500,
  showPlaceholder = false,
}: AdUnitProps) {
  const ref = useRef<HTMLModElement | null>(null);
  const [visible, setVisible] = useState(false);     // Reklamı gerçekten göster
  const [giveUp, setGiveUp] = useState(false);       // Zaman aşımında tamamen gizle

  useEffect(() => {
    if (!ref.current) return;

    // 1) Reklamı talep et
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adblock vb. durumlarda push hata atabilir
    }

    // 2) iframe geldi mi diye izle
    const el = ref.current;
    const check = () => {
      const hasIframe = !!el.querySelector("iframe");
      if (hasIframe) {
        setVisible(true);
        return true;
      }
      return false;
    };

    const obs = new MutationObserver(() => {
      if (check()) obs.disconnect();
    });
    obs.observe(el, { childList: true, subtree: true });

    // 3) Süre dolarsa gizle
    const t = setTimeout(() => {
      if (!check()) {
        setGiveUp(true);
        obs.disconnect();
      }
    }, timeoutMs);

    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [adSlot, timeoutMs]);

  // Zaman aşımında hiç yer kaplamasın
  if (giveUp) return null;

  return (
    <div className={className}>
      {/* İsteyenler için koyu küçük placeholder (reklam gelene kadar) */}
      {!visible && showPlaceholder && (
        <div className="h-32 rounded-xl border border-border bg-card/40 animate-pulse" />
      )}

      {/* Reklam container — iframe geldiyse görünür, gelene kadar hidden */}
      <ins
        ref={ref as any}
        className={`adsbygoogle ${visible ? "" : "hidden"}`}
        style={{
          display: "block",
          textAlign: "center",
          background: "transparent",
        }}
        data-ad-client="ca-pub-8264540196990511"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
