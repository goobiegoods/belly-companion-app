import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgba(255,200,80,0.2)", color: "#B08020" },
  processing: { bg: "rgba(200,180,255,0.2)", color: "#7040A0" },
  shipped: { bg: "rgba(200,240,220,0.2)", color: "#40A060" },
  delivered: { bg: "rgba(200,240,210,0.3)", color: "#30A050" },
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, [user]);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
    catch { return d; }
  };

  const getStatusStyle = (s: string) => STATUS_STYLES[s] || STATUS_STYLES.pending;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FEF8F4" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FF7840", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "#FEF8F4" }}>
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-[22px] font-semibold" style={{ color: "#C85828" }}>My Orders</h1>
        <p className="text-[11px]" style={{ color: "#C4906A" }}>Your Belly Shop history</p>
      </div>

      <div className="px-5">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(255,200,170,0.2)" }}>
              <span className="text-3xl">🛍️</span>
            </div>
            <p className="font-display text-[16px] font-semibold mb-1" style={{ color: "#A84E28" }}>No orders yet</p>
            <p className="text-[13px] italic mb-4" style={{ color: "#D4906A" }}>Your natural remedies will appear here</p>
            <button onClick={() => navigate("/shop")}
              className="rounded-full px-5 py-2.5 text-[13px] font-semibold"
              style={{ background: "linear-gradient(145deg, #FF7840, #FFAB80)", color: "white" }}>
              Shop remedies →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const ss = getStatusStyle(order.status);
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="rounded-[16px] p-4" style={{
                  background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)",
                  backdropFilter: "blur(12px)",
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium" style={{ color: "#A84E28" }}>{formatDate(order.created_at)}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: ss.bg, color: ss.color }}>
                      {order.status}
                    </span>
                  </div>
                  {items.length > 0 && (
                    <div className="mb-2">
                      {items.map((item: any, i: number) => (
                        <p key={i} className="text-[12px]" style={{ color: "#C4906A" }}>
                          {item.name || item.title || "Item"} {item.qty ? `× ${item.qty}` : ""}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between" style={{ borderTop: "0.5px solid rgba(255,170,130,0.14)", paddingTop: 8 }}>
                    <span className="text-[13px] font-semibold" style={{ color: "#A84E28" }}>${Number(order.total).toFixed(2)}</span>
                    {order.status === "shipped" && (
                      <span className="text-[11px] font-medium" style={{ color: "#FF7840" }}>Track order →</span>
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
