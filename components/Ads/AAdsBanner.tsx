type Props = {
  unitId: string;       // A-Ads panelinden aldığın ID (ör: 2408771)
  width?: string;       // genişlik (% veya px)
  height?: string;      // yükseklik (ör: "250px")
};

export default function AAdsBanner({
  unitId,
  width = "70%",
  height = "250px", // height:auto CLS riski yaratır, min-height ekliyoruz
}: Props) {
  return (
    <div
      id="frame"
      style={{
        width: "100%",
        margin: "auto",
        background: "rgba(0, 0, 0, 0.5)",
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
          width: width,
          minHeight: height,   // güvenli yükseklik
          overflow: "hidden",
          display: "block",
          margin: "auto",
          backgroundColor: "transparent",
        }}
        title="A-Ads banner"
      />
    </div>
  );
}
