import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StripeEmbeddedCheckoutForm } from "./StripeEmbeddedCheckout";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PremiumModal({ open, onClose }: Props) {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<"premium_monthly" | "premium_annual">("premium_annual");
  const [showCheckout, setShowCheckout] = useState(false);

  if (!open) return null;

  // Already-premium guard — prevents duplicate subscriptions
  if (profile?.is_premium) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
        <div className="w-full" onClick={(e) => e.stopPropagation()}
          style={{
            background: "#FF8C42", borderRadius: "24px 24px 0 0",
            padding: "32px 24px calc(32px + env(safe-area-inset-bottom))",
            textAlign: "center",
            animation: "sheetUp 240ms cubic-bezier(0.22,1,0.36,1)",
          }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            You're already Premium
          </p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 24 }}>
            Enjoy unlimited doula access and all premium courses 🌸
          </p>
          <button onClick={onClose}
            style={{
              width: "100%", height: 52, borderRadius: 14,
              background: "#fff", color: "#FF8C42",
              fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16,
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
    <div className="fixed inset-0 z-[1000] flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full" onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FF8C42", borderRadius: "24px 24px 0 0",
          maxHeight: "90vh", overflowY: "auto",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
          animation: "sheetUp 240ms cubic-bezier(0.22,1,0.36,1)",
        }}>
        {showCheckout ? (
          <div style={{ padding: 16 }}>
            <button onClick={() => setShowCheckout(false)}
              style={{ background: "none", border: "none", color: "#fff", fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
              ← Back
            </button>
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
            <div style={{ padding: "24px 24px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌟</div>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>Go Premium</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
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
                  <li key={b} style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ color: "#fff" }}>✓</span> {b}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setPlan("premium_monthly")}
                  style={{
                    flex: 1, padding: 16, textAlign: "center", borderRadius: 14, cursor: "pointer",
                    background: plan === "premium_monthly" ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.14)",
                    border: `2px solid ${plan === "premium_monthly" ? "#fff" : "rgba(255,255,255,0.22)"}`,
                  }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: "#fff" }}>$9.99</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>/month</p>
                </button>
                <button onClick={() => setPlan("premium_annual")}
                  style={{
                    flex: 1, padding: 16, textAlign: "center", borderRadius: 14, cursor: "pointer", position: "relative",
                    background: plan === "premium_annual" ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.14)",
                    border: `2px solid ${plan === "premium_annual" ? "#fff" : "rgba(255,255,255,0.22)"}`,
                  }}>
                  <span style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    fontSize: 9, padding: "2px 10px", borderRadius: 20, fontWeight: 700,
                    background: "white", color: "#FF8C42", fontFamily: "'Outfit', system-ui",
                  }}>SAVE 50%</span>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: "#fff" }}>$59.99</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>/year</p>
                </button>
              </div>

              <button onClick={() => setShowCheckout(true)}
                style={{
                  width: "100%", height: 52, borderRadius: 14,
                  background: "#fff", color: "#FF8C42",
                  fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                }}>
                Start 7-day free trial →
              </button>

              <button onClick={onClose}
                style={{
                  width: "100%", padding: 12, marginTop: 8,
                  background: "none", border: "none",
                  color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer",
                  fontFamily: "'Outfit', system-ui",
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
