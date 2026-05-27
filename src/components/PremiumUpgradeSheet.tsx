import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  // Optional: which feature triggered it — only affects copy slightly.
  source?: "week-lock" | "message-limit" | "journey";
}

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12l5 5L20 7" stroke="var(--color-accent-primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
      <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className="sheet-enter w-full"
          style={{ background: "var(--color-bg-card)", borderRadius: "24px 24px 0 0", padding: "32px 24px calc(32px + env(safe-area-inset-bottom))", textAlign: "center", maxWidth: 430, margin: "0 auto" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🌟</div>
          <p className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)" }}>You're already Premium</p>
          <p className="belly-support" style={{ marginTop: 6, marginBottom: 22 }}>Enjoy unlimited Bella access and every milestone 🌸</p>
          <button onClick={onClose} className="v2-btn-primary" style={{ width: "100%" }}>Got it</button>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    onClose();
    navigate("/me"); // existing premium flow lives in Profile via PremiumModal
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="sheet-enter w-full"
        style={{
          background: "var(--color-bg-card)",
          borderRadius: "24px 24px 0 0",
          padding: "10px 24px calc(28px + env(safe-area-inset-bottom))",
          maxWidth: 430,
          margin: "0 auto",
          maxHeight: "92vh",
          overflowY: "auto",
        }}>
        <div className="flex justify-center" style={{ paddingTop: 6, paddingBottom: 14 }}>
          <div style={{ width: 42, height: 5, borderRadius: 999, background: "var(--color-border-default)" }} />
        </div>

        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.15 }}>
          Your full pregnancy, <em style={{ fontStyle: "italic", color: "var(--color-accent-primary)" }}>unlocked</em>
        </h2>
        <p className="belly-body" style={{ marginTop: 8, marginBottom: 20, color: "var(--color-text-secondary)" }}>
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
                background: "var(--color-accent-light)",
                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}><Check /></span>
              <span className="belly-body">{b}</span>
            </li>
          ))}
        </ul>

        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 28, fontWeight: 700, color: "var(--color-accent-primary)", lineHeight: 1.1 }}>
            $9.99 <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>/ month</span>
          </p>
          <p className="belly-support" style={{ marginTop: 4 }}>or $59.99 / year — save 50%</p>
        </div>

        <button onClick={handleStart} className="v2-btn-primary" style={{ width: "100%" }}>
          Start free 7-day trial
        </button>
        <button onClick={onClose} style={{
          width: "100%", marginTop: 10, padding: 10, background: "none", border: "none",
          color: "var(--color-text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', system-ui",
        }}>Maybe later</button>
      </div>
    </div>
  );
}

export default PremiumUpgradeSheet;
