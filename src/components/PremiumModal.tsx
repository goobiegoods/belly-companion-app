import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StripeEmbeddedCheckoutForm } from "./StripeEmbeddedCheckout";
import { BellaOrb } from "@/components/golden";

interface Props {
  open: boolean;
  onClose: () => void;
}

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

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12l5 5L20 7" stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function PremiumModal({ open, onClose }: Props) {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<"premium_monthly" | "premium_annual">("premium_annual");
  const [showCheckout, setShowCheckout] = useState(false);

  if (!open) return null;

  // Already-premium guard — prevents duplicate subscriptions
  if (profile?.is_premium) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
        <div className="w-full" onClick={(e) => e.stopPropagation()}
          style={{
            ...sheetStyle,
            padding: "32px 24px calc(32px + env(safe-area-inset-bottom))",
            textAlign: "center",
            animation: "sheetUp 240ms cubic-bezier(0.22,1,0.36,1)",
          }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <BellaOrb size={44} />
          </div>
          <p className="gh-brand" style={{ fontSize: 24, marginBottom: 6 }}>
            You're already Premium
          </p>
          <p style={{ fontSize: 13, color: "rgba(251,238,224,0.75)", marginBottom: 24 }}>
            Enjoy unlimited doula access and all premium courses
          </p>
          <button onClick={onClose}
            style={{
              width: "100%", height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)",
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              border: "none", cursor: "pointer",
            }}>
            Got it
          </button>
        </div>
        <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full" onClick={(e) => e.stopPropagation()}
        style={{
          ...sheetStyle,
          maxHeight: "90vh", overflowY: "auto",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
          animation: "sheetUp 240ms cubic-bezier(0.22,1,0.36,1)",
        }}>
        {showCheckout ? (
          <div style={{ padding: 16 }}>
            <button onClick={() => setShowCheckout(false)}
              style={{ background: "none", border: "none", color: "var(--cream)", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
              ← Back
            </button>
            {/* Stripe's embedded checkout renders a light iframe — keep a white card behind it */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 12 }}>
              <StripeEmbeddedCheckoutForm
                priceId={plan}
                customerEmail={user?.email}
                userId={user?.id}
                returnUrl={`${window.location.origin}/premium-success?session_id={CHECKOUT_SESSION_ID}`}
              />
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: "26px 24px 16px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <BellaOrb size={40} />
              </div>
              <div className="gh-section-label" style={{ marginBottom: 4 }}>premium</div>
              <p className="gh-brand" style={{ fontSize: 26 }}>Go Premium</p>
              <p style={{ fontSize: 13, color: "rgba(251,238,224,0.7)", marginTop: 6 }}>
                Your complete pregnancy companion
              </p>
            </div>

            <div style={{ padding: "0 24px 24px" }}>
              <ul style={{ marginBottom: 20 }}>
                {[
                  "Unlimited AI doula messages",
                  "All premium courses unlocked",
                  "Priority human doula review",
                  "Downloadable birth plan",
                  "Ad-free experience",
                ].map((b) => (
                  <li key={b} style={{ fontSize: 14, color: "var(--cream)", display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <Check /> {b}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setPlan("premium_monthly")}
                  style={{
                    flex: 1, padding: 16, textAlign: "center", borderRadius: 14, cursor: "pointer",
                    background: plan === "premium_monthly" ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)",
                    border: `2px solid ${plan === "premium_monthly" ? "var(--gold)" : "rgba(255,255,255,0.18)"}`,
                  }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600, color: "var(--cream)" }}>$9.99</p>
                  <p style={{ fontSize: 11, color: "rgba(251,238,224,0.6)" }}>/month</p>
                </button>
                <button onClick={() => setPlan("premium_annual")}
                  style={{
                    flex: 1, padding: 16, textAlign: "center", borderRadius: 14, cursor: "pointer", position: "relative",
                    background: plan === "premium_annual" ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)",
                    border: `2px solid ${plan === "premium_annual" ? "var(--gold)" : "rgba(255,255,255,0.18)"}`,
                  }}>
                  <span style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    fontSize: 9, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                    background: "var(--gold)", color: "var(--night)", fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap", letterSpacing: "0.04em",
                  }}>SAVE 50%</span>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600, color: "var(--cream)" }}>$59.99</p>
                  <p style={{ fontSize: 11, color: "rgba(251,238,224,0.6)" }}>/year</p>
                </button>
              </div>

              <button onClick={() => setShowCheckout(true)}
                style={{
                  width: "100%", height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)",
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 8px 24px -8px rgba(242,182,71,0.5)",
                }}>
                Start 7-day free trial →
              </button>

              <button onClick={onClose}
                style={{
                  width: "100%", padding: 12, marginTop: 8,
                  background: "none", border: "none",
                  color: "rgba(251,238,224,0.6)", fontSize: 12, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}>
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
