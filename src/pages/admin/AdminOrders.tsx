import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  items: any;
  shipping_address: string | null;
  created_at: string;
}

const STATUSES = ["all", "pending", "paid", "shipped", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setOrders((data as any) ?? []);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const markShipped = async (id: string) => {
    const { error } = await supabase.from("orders").update({ status: "shipped" }).eq("id", id);
    if (error) {
      toast.error("Failed to update order");
    } else {
      toast.success("Marked as shipped");
      load();
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Orders</h1>
      <p style={{ fontSize: 13, color: "#7A7A85", marginBottom: 20 }}>Manage customer orders and fulfilment.</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid " + (filter === s ? "#FF8C42" : "#26262C"),
              background: filter === s ? "rgba(255,140,66,0.10)" : "transparent",
              color: filter === s ? "#FF8C42" : "#C8C8D0",
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: "#16161A", border: "1px solid #26262C", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1B1B20", color: "#7A7A85", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Order</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>User</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Total</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#7A7A85" }}>No orders.</td></tr>
            )}
            {orders.map((o) => (
              <>
                <tr key={o.id} style={{ borderTop: "1px solid #26262C", cursor: "pointer" }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 11 }}>{o.id.slice(0, 8)}</td>
                  <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 11, color: "#7A7A85" }}>{o.user_id.slice(0, 8)}</td>
                  <td style={{ padding: "12px 18px", color: "#fff" }}>${Number(o.total).toFixed(2)}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ background: "rgba(255,140,66,0.12)", color: "#FF8C42", padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "12px 18px", color: "#7A7A85" }}>{new Date(o.created_at).toLocaleString()}</td>
                  <td style={{ padding: "12px 18px", textAlign: "right" }}>
                    {o.status !== "shipped" && o.status !== "cancelled" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markShipped(o.id); }}
                        style={{ background: "#FF8C42", color: "#0F0F11", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        Mark shipped
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr style={{ background: "#0F0F11" }}>
                    <td colSpan={6} style={{ padding: 18 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#7A7A85", textTransform: "uppercase", marginBottom: 6 }}>Items</p>
                      <pre style={{ fontSize: 11, color: "#C8C8D0", background: "#16161A", padding: 12, borderRadius: 8, overflow: "auto" }}>{JSON.stringify(o.items, null, 2)}</pre>
                      {o.shipping_address && (
                        <>
                          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#7A7A85", textTransform: "uppercase", margin: "12px 0 6px" }}>Shipping</p>
                          <p style={{ fontSize: 12, color: "#C8C8D0" }}>{o.shipping_address}</p>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
