import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, cartTotal, updateQty, removeItem } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isEmpty = items.length === 0;
  const shippingFee = cartTotal >= 40 ? 0 : (items.length > 0 ? 5 : 0);
  const grandTotal = cartTotal + shippingFee;

  const handleCheckout = async () => {
    if (!user || isEmpty || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      console.log('[checkout] requesting session…');
      const { data, error } = await supabase.functions.invoke('create-shop-checkout', {
        body: {
          items: items.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty })),
          userId: user.id,
          customerEmail: user.email,
          shippingFee,
          environment: getStripeEnvironment(),
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned from Stripe');
      console.log('[checkout] redirecting to', data.url);
      await new Promise(r => setTimeout(r, 50));
      window.location.href = data.url;
    } catch (err) {
      console.error('[checkout] error', err);
      toast.error('Something went wrong — please try again');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-enter gh-scene-shop" style={{ minHeight: "100vh", color: "var(--cream)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >←</button>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>Your cart</h1>
        <div style={{ width: 38 }} />
      </div>

      {/* Body */}
      <div className="px-4" style={{ paddingBottom: 160 }}>
        {isEmpty ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 16px" }}>
            <span style={{ fontSize: 48, marginBottom: 16 }}>🛍️</span>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 6 }}>Your cart is empty</h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 22 }}>Add some remedies to get started</p>
            <button
              onClick={() => navigate("/shop")}
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)",
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
                borderRadius: 14, padding: "12px 24px", border: "none", cursor: "pointer",
              }}
            >Browse Remedies →</button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10, marginTop: 4 }}>ITEMS</p>

            {items.map(item => (
              <div
                key={item.product.id}
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 16, padding: 14, marginBottom: 10,
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {item.product.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, color: "#fff", lineHeight: 1.3 }}>
                    {item.product.name}
                  </p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                    {item.qty} × ${item.product.price.toFixed(2)} · ${(item.qty * item.product.price).toFixed(2)}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => updateQty(item.product.id, -1)}
                    aria-label="Decrease quantity"
                    style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >−</button>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.product.id, 1)}
                    aria-label="Increase quantity"
                    style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >+</button>
                </div>

                <button
                  onClick={() => removeItem(item.product.id)}
                  aria-label="Remove item"
                  style={{
                    position: "absolute", top: 6, right: 8,
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    fontSize: 16, cursor: "pointer", padding: 4, lineHeight: 1,
                  }}
                >×</button>
              </div>
            ))}

            {/* ORDER SUMMARY */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "16px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Subtotal</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>${cartTotal.toFixed(2)}</span>
            </div>

            {cartTotal < 40 ? (
              <div style={{ marginBottom: 14 }}>
                <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                  <div style={{ height: 4, borderRadius: 4, background: "linear-gradient(90deg, var(--teal), var(--gold))", width: `${Math.min(100, (cartTotal / 40) * 100)}%`, transition: "width 0.3s ease" }} />
                </div>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>
                  Add ${(40 - cartTotal).toFixed(2)} more for free shipping 🚚
                </p>
              </div>
            ) : (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 14 }}>
                🎉 Free shipping unlocked!
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Shipping</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: shippingFee === 0 ? 700 : 500, fontSize: 13, color: shippingFee === 0 ? "#fff" : "rgba(255,255,255,0.85)" }}>
                {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>Total</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>${grandTotal.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Sticky checkout button */}
      <div
        style={{
          position: "fixed", left: 0, right: 0, bottom: 80,
          maxWidth: 430, margin: "0 auto",
          padding: "0 16px",
          pointerEvents: "none",
          zIndex: 50,
        }}
      >
        <button
          onClick={handleCheckout}
          disabled={isEmpty || checkoutLoading}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, var(--gold), var(--ember))",
            color: "var(--night)",
            fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17,
            borderRadius: 16, padding: 16, border: "none",
            cursor: isEmpty || checkoutLoading ? "not-allowed" : "pointer",
            opacity: isEmpty ? 0.5 : (checkoutLoading ? 0.75 : 1),
            boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            pointerEvents: "auto",
          }}
        >
          {checkoutLoading ? (
            <>
              <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--night)", borderTopColor: "transparent", display: "inline-block", animation: "spin 700ms linear infinite" }} />
              Redirecting…
            </>
          ) : (
            <>Checkout → ${grandTotal.toFixed(2)}</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Cart;
