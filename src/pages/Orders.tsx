import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";

const TEAL_PILL = { bg: "rgba(44,156,143,0.24)", color: "#7fe0d3" };
const GOLD_PILL = { bg: "rgba(242,182,71,0.22)", color: "var(--gold)" };

const STATUS_STYLES: Record<string, { bg: string; color: string; label?: string }> = {
  pending_payment: { ...GOLD_PILL, label: "Awaiting payment" },
  paid: { ...TEAL_PILL, label: "Paid" },
  pending: { ...GOLD_PILL },
  processing: { ...TEAL_PILL },
  shipped: { ...TEAL_PILL },
  delivered: { ...TEAL_PILL },
};

/** Package line icon for the empty state. */
const PackageIcon = ({ size = 34 }: { size?: number }) => (
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
  >
    <path d="M21 8.5 12 3.5 3 8.5v8l9 5 9-5v-8Z" />
    <path d="M3 8.5l9 5 9-5" />
    <path d="M12 13.5v8" />
    <path d="M7.5 6l9 5" />
  </svg>
);

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("orders").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, [user?.id]);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
    catch { return d; }
  };

  const getStatusStyle = (s: string) => STATUS_STYLES[s] || STATUS_STYLES.pending;

  if (loading) {
    return (
      <SceneBackground scene="shop">
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
          />
        </div>
      </SceneBackground>
    );
  }

  return (
    <SceneBackground scene="shop" className="page-enter">
      <GhHeader brand="My orders" tag="bella's apothecary" brandSize={20} />

      <div style={{ padding: "4px 16px 110px" }}>
        {orders.length === 0 ? (
          <GlassCard style={{ textAlign: "center", padding: "36px 20px", marginTop: 24 }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 14px",
                background: "rgba(242,182,71,0.14)", border: "1px solid rgba(242,182,71,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <PackageIcon />
            </div>
            <p className="font-gh-serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--cream)", marginBottom: 5 }}>
              No orders yet
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(251,238,224,0.55)", marginBottom: 20 }}>
              Your natural remedies will appear here
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="belly-btn-press"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--ember))",
                color: "var(--night)",
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
                borderRadius: 13, padding: "12px 24px", border: "none", cursor: "pointer",
              }}
            >
              Shop remedies →
            </button>
          </GlassCard>
        ) : (
          <div>
            {orders.map((order: any) => {
              const ss = getStatusStyle(order.status);
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <GlassCard key={order.id} style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span className="font-gh-mono" style={{ fontSize: 11, color: "rgba(251,238,224,0.7)" }}>
                      {formatDate(order.created_at)}
                    </span>
                    <span
                      className="capitalize"
                      style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.04em",
                        padding: "3px 10px", borderRadius: 20,
                        background: ss.bg, color: ss.color,
                      }}
                    >
                      {ss.label || order.status}
                    </span>
                  </div>
                  {items.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      {items.map((item: any, i: number) => (
                        <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                          <span className="font-gh-serif" style={{ fontSize: 13, color: "var(--cream)", lineHeight: 1.35 }}>
                            {item.name || item.title || "Item"} {item.qty ? `× ${item.qty}` : ""}
                          </span>
                          {item.price != null && (
                            <span className="font-gh-mono" style={{ fontSize: 12, color: "var(--gold)", flexShrink: 0 }}>
                              ${(Number(item.price) * (item.qty || 1)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 10,
                    }}
                  >
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(251,238,224,0.7)" }}>
                      Total
                    </span>
                    <span className="font-gh-mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--gold)" }}>
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                  {order.status === "shipped" && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "#7fe0d3", marginTop: 8 }}>
                      Track order →
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </SceneBackground>
  );
};

export default Orders;
