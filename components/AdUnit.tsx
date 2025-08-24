'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

type AdUnitProps = {
  /** AdSense slot id (ör. "7224318004") */
  slot: string;
  /** Tailwind / custom class */
  className?: string;
  /** Reklam gelmezse otomatik gizle */
  collapseIfEmpty?: boolean;
  /** Sadece testte kullan: test reklamı gösterir */
  test?: boolean;
};

export default function AdUnit({
  slot,
  className,
  collapseIfEmpty = true,
  test = false,
}: AdUnitProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!collapseIfEmpty);

  useEffect(() => {
    if (!ref.current) return;

    // AdSense'i tetikle
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }

    if (!collapseIfEmpty) return;

    const el = ref.current;

    // iframe oluştuğunda görünür yap
    const obs = new MutationObserver(() => {
      const iframe = el.querySelector('iframe');
      if (iframe && iframe.clientHeight > 0) {
        setVisible(true);
        obs.disconnect();
      }
    });
    obs.observe(el, { childList: true, subtree: true });

    // 3.5 sn içinde iframe gelmezse gizle
    const t = setTimeout(() => {
      const iframe = el.querySelector('iframe');
      if (!iframe || iframe.clientHeight === 0) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    }, 3500);

    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [slot, collapseIfEmpty]);

  if (!visible && collapseIfEmpty) return null;

  return (
    <ins
      ref={ref as any}
      // Koyu temaya uyumlu placeholder
      className={`adsbygoogle block rounded-xl overflow-hidden bg-muted ${className ?? ''}`}
      style={{
        display: 'block',
        minHeight: 250, // responsive için makul bir minimum
      }}
      data-ad-client="ca-pub-8264540196990511"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      // Test modunu sadece denemede aç
      {...(test ? { 'data-adtest': 'on' } : {})}
    />
  );
}
