"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type AdUnitProps = {
  /** AdSense ad slot id (ör: "7224318004") */
  adSlot: string;
  /** Tailwind vs. ek sınıflar */
  className?: string;
  /** AdSense formatı; çoğu durumda 'auto' bırak */
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  /** Tam genişlikte responsive olsun mu */
  fullWidthResponsive?: boolean;
  /** İstersen style ile override edebilirsin */
  style?: React.CSSProperties;
};

export default function AdUnit({
  adSlot,
  className,
  format = "auto",
  fullWidthResponsive = true,
  style,
}: AdUnitProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [adSlot]);

  return (
    <ins
      className={`adsbygoogle ${className ?? ""}`}
      style={{
        display: "block",
        textAlign: "center",
        background: "transparent", // boşken beyaz kutu olmasın
        ...style,
      }}
      data-ad-client="ca-pub-8264540196990511"
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
    />
  );
}
