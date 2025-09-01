type Props = {
  unitId: string;
  className?: string;
};

export default function AAdsBanner({ unitId, className = "" }: Props) {
  return (
    <div
      className={`w-full flex justify-center ${className}`}
      style={{
        margin: "0 auto",
        background: "transparent",
        position: "relative",
        zIndex: 99998,
      }}
    >
      <iframe
        data-aa={unitId}
        src={`//acceptable.a-ads.com/${unitId}/?size=Adaptive`}
        style={{
          border: "0",
          padding: "0",
          width: "100%",          // container kadar geniş
          maxWidth: "728px",      // büyük ekranda üst sınır
          height: "auto",         // reklam boyutuna uyum sağla
          aspectRatio: "728/90",  // CLS önlemek için: genişlik 728px iken 90px yükseklik
          overflow: "hidden",
          display: "block",
          margin: "0 auto",
          backgroundColor: "transparent",
        }}
        title="A-Ads banner"
      />
    </div>
  );
}
