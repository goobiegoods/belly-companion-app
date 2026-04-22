import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface Props {
  week: number;
  fruitEmoji: string;
  fruitName: string;
  weight: string;
  length: string;
  trimester?: number;
}

const ShareableWeekCard = ({ week, fruitEmoji, fruitName, weight, length, trimester }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: "#FF8C42" });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `belly-week-${week}.png`, { type: "image/png" });

      const navAny = navigator as any;
      if (navAny.canShare?.({ files: [file] })) {
        await navAny.share({ files: [file], title: `My Week ${week} Update!`, text: `I'm in week ${week}! 🌸` });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `belly-week-${week}.png`;
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
    <div style={{ marginTop: 16 }}>
      <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, color: "rgba(255,255,255,0.50)", fontWeight: 600 }}>SHARE THIS WEEK</p>

      <div
        id="shareable-card"
        ref={cardRef}
        style={{
          background: "#FF8C42",
          borderRadius: 20,
          padding: 24,
          textAlign: "center",
          color: "white",
          width: "100%",
          boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start", marginBottom: 14 }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1 }}>belly</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Virtual Doula</p>
          </div>
        </div>

        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 8, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.18))" }}>{fruitEmoji}</div>

        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 900, color: "#fff", letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>Week {week}</p>
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 16, textTransform: "capitalize" }}>Baby is the size of a {fruitName}!</p>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ background: "rgba(255,255,255,0.20)", borderRadius: 20, padding: "5px 12px", fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 600, color: "#fff" }}>
            {weight}
          </div>
          <div style={{ background: "rgba(255,255,255,0.20)", borderRadius: 20, padding: "5px 12px", fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 600, color: "#fff" }}>
            {length}
          </div>
          {trimester && (
            <div style={{ background: "rgba(255,255,255,0.20)", borderRadius: 20, padding: "5px 12px", fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 600, color: "#fff" }}>
              Trimester {trimester}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleShare}
        disabled={busy}
        style={{
          marginTop: 12,
          width: "100%",
          background: "#ffffff",
          border: "none",
          borderRadius: 14,
          padding: 14,
          fontFamily: "'Fraunces', serif",
          fontSize: 16,
          fontWeight: 700,
          color: "#FF8C42",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? "Preparing…" : "Share this week 📤"}
      </button>
    </div>
  );
};

export default ShareableWeekCard;
