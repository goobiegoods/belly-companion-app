import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface Props {
  week: number;
  fruitEmoji: string;
  fruitName: string;
  emotionalFact: string;
}

const ShareableMilestoneCard = ({ week, fruitEmoji, fruitName, emotionalFact }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true, backgroundColor: "#FDF8F2" });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `belly-milestone-week-${week}.png`, { type: "image/png" });
      const navAny = navigator as any;
      if (navAny.canShare?.({ files: [file] })) {
        await navAny.share({ files: [file], title: `Week ${week}`, text: emotionalFact });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `belly-milestone-week-${week}.png`;
        a.click();
        toast.success("Saved to your device 📥");
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate the card. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Off-screen 1080x1920 export canvas */}
      <div style={{ position: "absolute", left: -10000, top: 0, pointerEvents: "none" }}>
        <div ref={ref} style={{
          width: 1080, height: 1920,
          background: "#FDF8F2",
          position: "relative",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 80, color: "#1A1208",
          fontFamily: "'Outfit', system-ui, sans-serif",
          overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -120, left: -120, width: 480, height: 480, borderRadius: "50%", background: "rgba(244,123,32,0.08)" }} />
          <div style={{ position: "absolute", bottom: -160, right: -160, width: 560, height: 560, borderRadius: "50%", background: "rgba(244,123,32,0.10)" }} />
          <div style={{ position: "absolute", top: 280, right: -80, width: 220, height: 220, borderRadius: "50%", background: "rgba(244,123,32,0.06)" }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 360, lineHeight: 1, marginBottom: 40, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.12))" }}>{fruitEmoji}</div>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 200, fontWeight: 700, color: "#F47B20", lineHeight: 1, letterSpacing: -6, marginBottom: 24 }}>week {week}</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 600, color: "#1A1208", marginBottom: 32 }}>
              Your baby is the size of a {fruitName}
            </p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 44, fontWeight: 500, color: "#6B5B4E", lineHeight: 1.4, maxWidth: 820, margin: "0 auto" }}>
              {emotionalFact}
            </p>
          </div>

          <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, textAlign: "center", zIndex: 1 }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 800, color: "#F47B20", letterSpacing: -1 }}>belly</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 22, fontWeight: 500, color: "#A8917E", marginTop: 6, letterSpacing: "0.18em", textTransform: "uppercase" }}>Virtual Doula</p>
          </div>
        </div>
      </div>

      <button onClick={handleShare} disabled={busy} className="v2-btn-secondary" style={{ width: "100%", height: 44, fontSize: 14 }}>
        {busy ? "Preparing…" : "Share my week 📤"}
      </button>
    </div>
  );
};

export default ShareableMilestoneCard;
