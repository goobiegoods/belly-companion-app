import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Metrics {
  users: number;
  ordersToday: number;
  pendingOrders: number;
  dau: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  user_id: string;
}

const Card = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div style={{ background: "#16161A", border: "1px solid #26262C", borderRadius: 14, padding: 20 }}>
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#7A7A85", textTransform: "uppercase" }}>{label}</p>
    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 800, color: "#fff", marginTop: 6, letterSpacing: -1 }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: "#7A7A85", marginTop: 2 }}>{sub}</p>}
  </div>
);

const AdminOverview = () => {
  const [m, setM] = useState<Metrics>({ users: 0, ordersToday: 0, pendingOrders: 0, dau: 0 });
  const [recent, setRecent] = useState<RecentOrder[]>([]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ count: users }, { count: ordersToday }, { count: pendingOrders }, { count: dau }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00Z`),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("mood_logs").select("user_id", { count: "exact", head: true }).gte("logged_at", `${today}T00:00:00Z`),
        supabase.from("orders").select("id, total, status, created_at, user_id").order("created_at", { ascending: false }).limit(8),
      ]);
      setM({ users: users ?? 0, ordersToday: ordersToday ?? 0, pendingOrders: pendingOrders ?? 0, dau: dau ?? 0 });
      setRecent((orders as any) ?? []);
    })();
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Overview</h1>
      <p style={{ fontSize: 13, color: "#7A7A85", marginBottom: 28 }}>Live metrics across the Belly app.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        <Card label="Total users" value={m.users} />
        <Card label="Orders today" value={m.ordersToday} />
        <Card label="Pending orders" value={m.pendingOrders} sub="Awaiting fulfilment" />
        <Card label="DAU (mood logs)" value={m.dau} sub="Today" />
      </div>

      <div style={{ background: "#16161A", border: "1px solid #26262C", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #26262C" }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700 }}>Recent orders</p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1B1B20", color: "#7A7A85", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Order</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Total</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#7A7A85" }}>No orders yet.</td></tr>
            )}
            {recent.map((o) => (
              <tr key={o.id} style={{ borderTop: "1px solid #26262C" }}>
                <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 11 }}>{o.id.slice(0, 8)}</td>
                <td style={{ padding: "12px 18px", color: "#fff" }}>${Number(o.total).toFixed(2)}</td>
                <td style={{ padding: "12px 18px" }}>
                  <span style={{ background: "rgba(255,140,66,0.12)", color: "#FF8C42", padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>{o.status}</span>
                </td>
                <td style={{ padding: "12px 18px", color: "#7A7A85" }}>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOverview;
