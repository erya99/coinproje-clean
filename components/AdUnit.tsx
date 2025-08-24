// components/AdUnit.tsx
'use client';

import { useEffect } from 'react';

type Props = {
  slot: string;
  className?: string;
};

export default function AdUnit({ slot, className }: Props) {
  useEffect(() => {
    // adsbygoogle global'ini tetikle
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <ins
      className={`adsbygoogle block ${className || ''}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-82645401969908511"  // kendi client id'in
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
