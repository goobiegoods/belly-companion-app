import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BellaOrb } from "@/components/golden";

interface Props {
  open: boolean;
  onClose: () => void;
  // Optional: which feature triggered it — only affects copy slightly.
  source?: "week-lock" | "message-limit" | "journey";
}

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12l5 5L20 7" stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const sheetStyle: React.CSSProperties = {
  background: "rgba(21,10,31,0.94)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderTop: "1px solid var(--glass-border)",
  borderRadius: "24px 24px 0 0",
  maxWidth: 430,
  margin: "0 auto",
  color: "var(--cream)",
  fontFamily: "'Inter', system-ui, sans-serif",
};

export function PremiumUpgradeSheet({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  if (profile?.is_premium) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className="sheet-enter w-full"
          style={{ ...sheetStyle, padding: "32px 24px calc(32px + env(safe-area-inset-bottom))", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <BellaOrb size={44} />
          </div>
          <p className="gh-brand" style={{ fontSize: 22 }}>You're already Premium</p>
          <p style={{ fontSize: 13, color: "rgba(251,238,224,0.75)", marginTop: 6, marginBottom: 22 }}>
            Enjoy unlimited Bella access and every milestone
          </p>
          <button onClick={onClose}
            style={{
              width: "100%", height: 50, borderRadius: 14,
              background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)",
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
            }}>
            Got it
          </button>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    onClose();
    navigate("/me"); // existing premium flow lives in Profile via PremiumModal
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="sheet-enter w-full"
        style={{
          ...sheetStyle,
          padding: "10px 24px calc(28px + env(safe-area-inset-bottom))",
          maxHeight: "92vh",
          overflowY: "auto",
        }}>
        <div className="flex justify-center" style={{ paddingTop: 6, paddingBottom: 14 }}>
          <div style={{ width: 42, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.25)" }} />
        </div>

        <h2 className="gh-brand" style={{ fontSize: 26, lineHeight: 1.2 }}>
          Your full pregnancy, <em style={{ fontStyle: "italic", fontWeight: 300, background: "linear-gradient(90deg, var(--gold), var(--magenta))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>unlocked</em>
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, marginBottom: 20, color: "rgba(251,238,224,0.75)" }}>
          Everything you need from week 1 to birth.
        </p>

        <ul style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
          {[
            "Unlimited Bella conversations",
            "All 40 weeks of baby development",
            "Exclusive milestone badges & journey map",
          ].map((b) => (
            <li key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "rgba(242,182,71,0.16)",
                border: "1px solid rgba(242,182,71,0.35)",
                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}><Check /></span>
              <span style={{ fontSize: 14, color: "var(--cream)" }}>{b}</span>
            </li>
          ))}
        </ul>

        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 600, color: "var(--gold)", lineHeight: 1.1 }}>
            $9.99 <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(251,238,224,0.6)", fontFamily: "'Inter', sans-serif" }}>/ month</span>
          </p>
          <p style={{ fontSize: 12, color: "rgba(251,238,224,0.6)", marginTop: 4 }}>or $59.99 / year — save 50%</p>
        </div>

        <button onClick={handleStart}
          style={{
            width: "100%", height: 50, borderRadius: 14,
            background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)",
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
            boxShadow: "0 8px 24px -8px rgba(242,182,71,0.5)",
          }}>
          Start free 7-day trial
        </button>
        <button onClick={onClose} style={{
          width: "100%", marginTop: 10, padding: 10, background: "none", border: "none",
          color: "rgba(251,238,224,0.6)", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif",
        }}>Maybe later</button>
      </div>
    </div>
  );
}

export default PremiumUpgradeSheet;
