import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SceneBackground, GlassCard, BellaOrb } from "@/components/golden";

/** Tiny gold check for the benefits list. */
const GoldCheck = ({ size = 14 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="var(--gold)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={{ flexShrink: 0 }}
  >
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const BENEFITS = [
  "Unlimited doula access with Bella",
  "Every premium course, unlocked",
  "7-day free trial — cancel anytime",
];

const PremiumSuccess = () => {
  const navigate = useNavigate();
  const { refreshProfile, profile } = useAuth();
  const [polling, setPolling] = useState(true);

  // Webhook may take a few seconds to process — poll the profile until is_premium flips.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      attempts += 1;
      await refreshProfile();
      if (cancelled) return;
      if (profile?.is_premium || attempts >= 8) {
        setPolling(false);
        return;
      }
      setTimeout(tick, 1500);
    };
    tick();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SceneBackground scene="today" className="page-enter">
      <div
        style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "32px 20px 110px",
        }}
      >
        <GlassCard style={{ width: "100%", maxWidth: 360, textAlign: "center", padding: "32px 24px 28px", marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <BellaOrb size={48} />
          </div>
          <div className="gh-section-label" style={{ marginBottom: 6 }}>premium</div>
          <h1 className="gh-brand" style={{ fontSize: 26, marginBottom: 12 }}>
            Welcome to Premium
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13.5,
              color: "rgba(251,238,224,0.7)", lineHeight: 1.6,
              maxWidth: 300, margin: "0 auto 18px",
            }}
          >
            Your 7-day free trial has started. Enjoy unlimited doula access, all premium courses, and more.
          </p>

          <div style={{ textAlign: "left", margin: "0 auto 18px", maxWidth: 270 }}>
            {BENEFITS.map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <GoldCheck />
                <span className="font-gh-serif" style={{ fontSize: 13.5, color: "var(--cream)", lineHeight: 1.4 }}>
                  {b}
                </span>
              </div>
            ))}
          </div>

          {polling && !profile?.is_premium && (
            <p
              className="font-gh-mono"
              style={{ fontSize: 11, color: "rgba(251,238,224,0.55)", marginBottom: 16, letterSpacing: "0.04em" }}
            >
              activating your benefits…
            </p>
          )}
          {profile?.is_premium && (
            <p
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                color: "#7fe0d3", marginBottom: 16,
              }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#7fe0d3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              All Premium features unlocked
            </p>
          )}

          <button
            onClick={() => navigate("/")}
            className="belly-btn-press"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              color: "var(--night)",
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              borderRadius: 14, padding: "14px 24px", border: "none", cursor: "pointer",
            }}
          >
            Start exploring →
          </button>
        </GlassCard>
      </div>
    </SceneBackground>
  );
};

export default PremiumSuccess;
