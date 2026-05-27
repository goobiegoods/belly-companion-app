import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES: Record<string, { bg: string; color: string; label?: string }> = {
  pending_payment: { bg: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.7)", label: "Awaiting payment" },
  paid: { bg: "rgba(80,200,120,0.30)", color: "white", label: "Paid" },
  pending: { bg: "rgba(255,255,255,0.15)", color: "white" },
  processing: { bg: "rgba(255,255,255,0.2)", color: "white" },
  shipped: { bg: "rgba(255,255,255,0.25)", color: "white" },
  delivered: { bg: "rgba(255,255,255,0.3)", color: "white" },
};

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "transparent" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "white", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <div className="px-5 pt-5 pb-3">
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "white" }}>My Orders</h1>
        <p className="text-[11px]" style={{ color: "var(--w50)", fontFamily: "'Outfit', system-ui" }}>Your Belly Shop history</p>
      </div>

      <div className="px-5">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <span className="text-3xl">🛍️</span>
            </div>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 16, fontWeight: 600, color: "white", marginBottom: 4 }}>No orders yet</p>
            <p className="text-[13px] italic mb-4" style={{ color: "var(--w50)" }}>Your natural remedies will appear here</p>
            <button onClick={() => navigate("/shop")}
              className="rounded-full px-5 py-2.5 text-[13px] font-semibold"
              style={{ background: "white", color: "#FF6520", fontFamily: "'Outfit', system-ui", fontWeight: 700 }}>
              Shop remedies →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const ss = getStatusStyle(order.status);
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="rounded-[16px] p-4" style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", backdropFilter: "blur(14px)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 500, color: "white" }}>{formatDate(order.created_at)}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: ss.bg, color: ss.color }}>{ss.label || order.status}</span>
                  </div>
                  {items.length > 0 && (
                    <div className="mb-2">
                      {items.map((item: any, i: number) => (
                        <p key={i} style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, color: "var(--w70)" }}>
                          {item.name || item.title || "Item"} {item.qty ? `× ${item.qty}` : ""}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: "white" }}>${Number(order.total).toFixed(2)}</span>
                    {order.status === "shipped" && (
                      <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 600, color: "white" }}>Track order →</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
