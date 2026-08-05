import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { X, Sparkles, ScanLine, GraduationCap, ChefHat, Users, Sun, History, Leaf } from "lucide-react";
import { BellaOrb } from "@/components/golden";
import { PromoCodeRedeem } from "@/components/PromoCodeRedeem";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Plan = "annual" | "monthly";

// PLACEHOLDER — no payment is wired yet. Replace with the real Stripe
// subscription checkout (see api/stripe-checkout.ts) once live keys are ready.
function startCheckout(plan: Plan) {
  void plan;
  toast("Checkout is coming soon — you're on the list");
}

const BENEFITS: { label: string; icon: JSX.Element }[] = [
  { label: "Unlimited Belly AI", icon: <Sparkles size={15} /> },
  { label: "Unlimited Belly Lens", icon: <ScanLine size={15} /> },
  { label: "Courses", icon: <GraduationCap size={15} /> },
  { label: "Recipes", icon: <ChefHat size={15} /> },
  { label: "Community", icon: <Users size={15} /> },
  { label: "Daily Guidance", icon: <Sun size={15} /> },
  { label: "Saved History", icon: <History size={15} /> },
  { label: "Apothecary", icon: <Leaf size={15} /> },
];

const sheetStyle: React.CSSProperties = {
  background: "rgba(21,10,31,0.95)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  borderTop: "1px solid var(--glass-border)",
  borderRadius: "26px 26px 0 0",
  maxWidth: 430,
  margin: "0 auto",
  color: "var(--cream)",
  fontFamily: "'Inter', system-ui, sans-serif",
};

export function WelcomePaywall({ open, onClose }: Props) {
  const [plan, setPlan] = useState<Plan>("annual");

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

  const planCard = (
    which: Plan,
    content: React.ReactNode,
    badge?: string
  ) => (
    <button
      onClick={() => setPlan(which)}
      aria-pressed={plan === which}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 16,
        padding: "15px 16px",
        cursor: "pointer",
        position: "relative",
        background: plan === which ? "rgba(242,182,71,0.14)" : "rgba(255,255,255,0.06)",
        border: `1.5px solid ${plan === which ? "var(--gold)" : "rgba(255,255,255,0.16)"}`,
        transition: "background 180ms, border-color 180ms",
      }}
    >
      {badge && (
        <span
          style={{
            position: "absolute",
            top: -9,
            right: 14,
            fontSize: 9,
            padding: "3px 10px",
            borderRadius: 20,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: "linear-gradient(135deg, var(--gold), var(--ember))",
            color: "var(--night)",
            fontFamily: "'Inter', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </span>
      )}
      {content}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end"
      style={{ background: "rgba(10,6,16,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full"
        onClick={e => e.stopPropagation()}
        style={{
          ...sheetStyle,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "22px 24px calc(22px + env(safe-area-inset-bottom))",
          animation: "sheetUp 280ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(251,238,224,0.7)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={14} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <BellaOrb size={40} />
          </div>
          <div className="gh-section-label" style={{ marginBottom: 4 }}>belly pro</div>
          <p className="gh-brand" style={{ fontSize: 25, lineHeight: 1.2 }}>
            Keep Bella by your side
          </p>
          <p style={{ fontSize: 13, color: "rgba(251,238,224,0.7)", marginTop: 6, lineHeight: 1.5 }}>
            Everything Belly has to offer, for every season you're in
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "9px 12px",
            marginBottom: 20,
          }}
        >
          {BENEFITS.map(b => (
            <span
              key={b.label}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--cream)" }}
            >
              <span style={{ color: "var(--gold)", display: "inline-flex", flexShrink: 0 }}>{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
          {planCard(
            "annual",
            <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <span>
                <span style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 600, color: "var(--cream)" }}>
                  $8.25<span style={{ fontSize: 12, fontWeight: 500, color: "rgba(251,238,224,0.6)", fontFamily: "'Inter', sans-serif" }}> /month</span>
                </span>
                <span style={{ display: "block", fontSize: 11.5, color: "rgba(251,238,224,0.6)", marginTop: 3 }}>
                  billed annually at $99
                </span>
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--gold)", whiteSpace: "nowrap" }}>
                7-day free trial
              </span>
            </span>,
            "Best Value"
          )}
          {planCard(
            "monthly",
            <span style={{ display: "block" }}>
              <span style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 600, color: "var(--cream)" }}>
                $14.99<span style={{ fontSize: 12, fontWeight: 500, color: "rgba(251,238,224,0.6)", fontFamily: "'Inter', sans-serif" }}> /month</span>
              </span>
              <span style={{ display: "block", fontSize: 11.5, color: "rgba(251,238,224,0.6)", marginTop: 3 }}>
                cancel anytime
              </span>
            </span>
          )}
        </div>

        <button
          onClick={() => startCheckout(plan)}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--gold), var(--ember))",
            color: "var(--night)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px -8px rgba(242,182,71,0.5)",
          }}
        >
          {plan === "annual" ? "Start my 7-day free trial" : "Subscribe monthly"}
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            background: "none",
            border: "none",
            color: "rgba(251,238,224,0.6)",
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Maybe later
        </button>

        <PromoCodeRedeem />
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

export default WelcomePaywall;
