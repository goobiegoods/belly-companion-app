import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { SceneBackground, GlassCard } from "@/components/golden";

/** Big circled check — order confirmed. */
const CircledCheck = ({ size = 76 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="var(--teal)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={{ filter: "drop-shadow(0 0 14px rgba(44,156,143,0.5))" }}
  >
    <circle cx="12" cy="12" r="9.5" />
    <path d="M8 12.4l2.6 2.6L16 9.4" />
  </svg>
);

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { setCartCount } = useCart();

  useEffect(() => {
    // Clear cart now that the user has paid (webhook marks the order paid server-side).
    setCartCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SceneBackground scene="shop" className="page-enter">
      <div
        style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "32px 20px 110px",
        }}
      >
        <GlassCard style={{ width: "100%", maxWidth: 360, textAlign: "center", padding: "34px 24px 30px", marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <CircledCheck />
          </div>
          <h1 className="gh-brand" style={{ fontSize: 26, marginBottom: 12 }}>
            Order confirmed
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13.5,
              color: "rgba(251,238,224,0.7)", lineHeight: 1.6,
              maxWidth: 290, margin: "0 auto 10px",
            }}
          >
            Thanks, mama! We'll process your order and reach out with shipping details within 24 hours.
          </p>
          {sessionId && (
            <p className="font-gh-mono" style={{ fontSize: 10, color: "rgba(251,238,224,0.55)", marginBottom: 22, letterSpacing: "0.06em" }}>
              ref {sessionId.slice(-12)}
            </p>
          )}
          <button
            onClick={() => navigate("/shop")}
            className="belly-btn-press"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              color: "var(--night)",
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              borderRadius: 14, padding: "14px 24px", border: "none", cursor: "pointer",
              marginTop: sessionId ? 0 : 14,
            }}
          >
            Back to shop
          </button>
          <button
            onClick={() => navigate("/orders")}
            style={{
              marginTop: 12, background: "none",
              color: "rgba(251,238,224,0.7)",
              fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
              border: "none", cursor: "pointer", padding: "8px 16px",
            }}
          >
            View my orders
          </button>
        </GlassCard>
      </div>
    </SceneBackground>
  );
};

export default OrderSuccess;
