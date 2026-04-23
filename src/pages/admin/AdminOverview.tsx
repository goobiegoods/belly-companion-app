import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Btn,
  C,
  Card,
  Empty,
  MetricCard,
  PageTitle,
  SectionTitle,
  StatusPill,
  ago,
  fmtUSD,
  fontUI,
} from "@/components/admin/ui";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";

type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  items: any;
  promo_code?: string | null;
};

const STATUS_TONE: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  paid: "success",
  pending: "warning",
  shipped: "info",
  cancelled: "danger",
};

const AdminOverview = () => {
  const events = useAdminRealtime(20);
  const [users, setUsers] = useState(0);
  const [premium, setPremium] = useState(0);
  const [revAll, setRevAll] = useState(0);
  const [revToday, setRevToday] = useState(0);
  const [pending, setPending] = useState(0);
  const [usersLast7, setUsersLast7] = useState(0);
  const [premiumLast7, setPremiumLast7] = useState(0);
  const [revByDay, setRevByDay] = useState<{ day: string; revenue: number }[]>([]);
  const [recent, setRecent] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const refresh = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenAgo = new Date();
    sevenAgo.setDate(sevenAgo.getDate() - 7);

    const [u, p, paidAll, paidToday, pend, uNew, pNew, paid7, recentOrders] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
      supabase.from("orders").select("total").eq("status", "paid"),
      supabase.from("orders").select("total").eq("status", "paid").gte("paid_at", startOfToday.toISOString()),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenAgo.toISOString()),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true).gte("premium_since", sevenAgo.toISOString()),
      supabase.from("orders").select("total, paid_at").eq("status", "paid").gte("paid_at", sevenAgo.toISOString()),
      supabase.from("orders").select("id, user_id, total, status, created_at, items, promo_code").order("created_at", { ascending: false }).limit(10),
    ]);

    setUsers(u.count ?? 0);
    setPremium(p.count ?? 0);
    setRevAll((paidAll.data ?? []).reduce((s: number, r: any) => s + Number(r.total || 0), 0));
    setRevToday((paidToday.data ?? []).reduce((s: number, r: any) => s + Number(r.total || 0), 0));
    setPending(pend.count ?? 0);
    setUsersLast7(uNew.count ?? 0);
    setPremiumLast7(pNew.count ?? 0);

    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    (paid7.data ?? []).forEach((r: any) => {
      const k = String(r.paid_at).slice(0, 10);
      if (k in days) days[k] += Number(r.total || 0);
    });
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    setRevByDay(
      Object.entries(days).map(([iso, revenue]) => ({
        day: dayLabels[new Date(iso).getDay()],
        revenue: Math.round(revenue * 100) / 100,
      }))
    );

    setRecent((recentOrders.data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length]);

  const markShipped = async (id: string) => {
    await supabase.from("orders").update({ status: "shipped", shipped_at: new Date().toISOString() }).eq("id", id);
    refresh();
  };

  return (
    <>
      <PageTitle
        title="Dashboard"
        right={<span style={{ ...fontUI, fontSize: 13, color: "#444" }}>{dateLabel}</span>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 22 }}>
        <MetricCard label="Total Users" value={users} delta={`+${usersLast7} this week`} deltaTone={usersLast7 > 0 ? "success" : "neutral"} />
        <MetricCard label="Revenue · all time" value={fmtUSD(revAll)} />
        <MetricCard label="Revenue · today" value={fmtUSD(revToday)} />
        <MetricCard
          label="Pending Orders"
          value={pending}
          delta={pending > 0 ? "⚡ Action needed" : "All clear"}
          deltaTone={pending > 0 ? "warning" : "success"}
        />
        <MetricCard label="Premium Members" value={premium} delta={`+${premiumLast7} this week`} deltaTone={premiumLast7 > 0 ? "premium" : "neutral"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 22 }}>
        <Card padding={20}>
          <SectionTitle>Revenue · last 7 days</SectionTitle>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={revByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                <XAxis dataKey="day" stroke="#444" style={{ ...fontUI, fontSize: 11 }} />
                <YAxis stroke="#444" style={{ ...fontUI, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "Outfit", fontSize: 12 }}
                  cursor={{ fill: "rgba(255,140,66,0.06)" }}
                />
                <Bar dataKey="revenue" fill={C.orange} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding={20} style={{ display: "flex", flexDirection: "column" }}>
          <SectionTitle>Live activity</SectionTitle>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 260, display: "flex", flexDirection: "column", gap: 10 }}>
            {events.length === 0 && <p style={{ ...fontUI, color: C.muted, fontSize: 12 }}>Waiting for events…</p>}
            {events.map((e) => (
              <div key={e.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14 }}>{e.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...fontUI, fontSize: 12, color: "#ddd", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.message}</p>
                  <p style={{ ...fontUI, fontSize: 10, color: C.muted, margin: 0 }}>{ago(e.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padding={0}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <SectionTitle>Recent orders</SectionTitle>
        </div>
        {loading ? (
          <Empty>Loading…</Empty>
        ) : recent.length === 0 ? (
          <Empty>No orders yet.</Empty>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
            <thead>
              <tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                {["Order", "Customer", "Items", "Promo", "Total", "Status", "Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => {
                const items = Array.isArray(o.items) ? o.items : [];
                const isOpen = expanded === o.id;
                return (
                  <>
                    <tr key={o.id} onClick={() => setExpanded(isOpen ? null : o.id)} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer" }}>
                      <td style={{ padding: "12px 20px", color: "#ddd", fontFamily: "monospace", fontSize: 11 }}>#{o.id.slice(0, 8)}</td>
                      <td style={{ padding: "12px 20px", color: "#aaa" }}>{o.user_id.slice(0, 8)}…</td>
                      <td style={{ padding: "12px 20px", color: "#aaa" }}>{items.length} item{items.length === 1 ? "" : "s"}</td>
                      <td style={{ padding: "12px 20px", color: o.promo_code ? C.orange : "#555" }}>{o.promo_code || "—"}</td>
                      <td style={{ padding: "12px 20px", color: "#fff", fontWeight: 600 }}>{fmtUSD(Number(o.total))}</td>
                      <td style={{ padding: "12px 20px" }}>
                        <StatusPill tone={STATUS_TONE[o.status] ?? "neutral"}>{o.status}</StatusPill>
                      </td>
                      <td style={{ padding: "12px 20px" }} onClick={(e) => e.stopPropagation()}>
                        {o.status === "paid" ? (
                          <Btn size="sm" onClick={() => markShipped(o.id)}>Mark Shipped</Btn>
                        ) : (
                          <Btn size="sm" variant="secondary">View</Btn>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderTop: `1px solid ${C.border}`, background: "#0c0c0c" }}>
                        <td colSpan={7} style={{ padding: "14px 20px", color: "#aaa" }}>
                          <p style={{ margin: "0 0 6px", fontSize: 11, color: C.muted }}>ITEMS</p>
                          {items.map((it: any, i: number) => (
                            <p key={i} style={{ margin: "2px 0", fontSize: 12 }}>
                              {it.emoji ?? "🛍️"} {it.name} × {it.qty ?? 1} — {fmtUSD(Number(it.price ?? 0))}
                            </p>
                          ))}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
};

export default AdminOverview;
