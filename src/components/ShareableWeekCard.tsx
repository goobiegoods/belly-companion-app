import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface Props {
  week: number;
  fruitEmoji: string;
  fruitName: string;
  weight: string;
  length: string;
}

const ShareableWeekCard = ({ week, fruitEmoji, fruitName, weight, length }: Props) => {
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
        await navAny.share({ files: [file], title: `Week ${week} · Belly`, text: `I'm in week ${week}! 🌸` });
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
        ref={cardRef}
        style={{
          background: "linear-gradient(155deg, #FF8C42 0%, #FF6520 100%)",
          borderRadius: 24,
          padding: "28px 22px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>belly</span>
          <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", opacity: 0.7 }}>VIRTUAL DOULA</span>
        </div>

        <div style={{ fontSize: 96, lineHeight: 1, marginBottom: 12, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.18))" }}>{fruitEmoji}</div>

        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 900, letterSpacing: -2, lineHeight: 1, marginBottom: 4 }}>Week {week}</p>
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 16, fontWeight: 600, opacity: 0.9, marginBottom: 18, textTransform: "capitalize" }}>About the size of a {fruitName}</p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 12, padding: "8px 14px" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700 }}>{weight}</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, fontWeight: 600, letterSpacing: "0.1em", opacity: 0.75 }}>WEIGHT</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 12, padding: "8px 14px" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700 }}>{length}</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, fontWeight: 600, letterSpacing: "0.1em", opacity: 0.75 }}>LENGTH</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleShare}
        disabled={busy}
        style={{
          marginTop: 10,
          width: "100%",
          background: "white",
          border: "none",
          borderRadius: 22,
          padding: "11px 20px",
          fontSize: 13,
          fontWeight: 700,
          color: "#FF6520",
          fontFamily: "'Outfit', system-ui",
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
