import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { C, Card, MetricCard, PageTitle, Label, StatusPill, ago, fmtUSD, fontUI, fontTitle } from "@/components/admin/ui";

function getCurrentWeek(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const conception = new Date(due);
  conception.setDate(conception.getDate() - 280);
  const weeks = Math.floor((now.getTime() - conception.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(40, weeks));
}

interface Metrics {
  totalUsers: number; newThisWeek: number; revenueToday: number; revenueAllTime: number;
  pendingOrders: number; premiumCount: number; t1: number; t2: number; t3: number;
}

interface RecentOrder { id: string; total: number; status: string; created_at: string; items: any[]; }

function playChime() {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.frequency.value = freq;
      osc.type = "sine";
      osc.start(ctx.currentTime + i * 0.13);
      osc.stop(ctx.currentTime + i * 0.13 + 0.45);
    });
  } catch {}
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [newOrderFlash, setNewOrderFlash] = useState(false);
  const events = useAdminRealtime(40);
  const prevFirstEventId = useMemo(() => events[0]?.id, []);

  useEffect(() => {
    const latest = events[0];
    if (latest?.type === "order" && latest.id !== prevFirstEventId) {
      setNewOrderFlash(true);
      playChime();
      setTimeout(() => setNewOrderFlash(false), 3500);
    }
  }, [events[0]?.id]);

  useEffect(() => {
    (async () => {
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [profilesRes, newUsersRes, premiumRes, revAllRes, revTodayRes, pendingRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("due_date", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("orders").select("total").eq("status", "paid"),
        supabase.from("orders").select("total").eq("status", "paid").gte("paid_at", todayStart.toISOString()),
        supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending_payment","pending"]),
        supabase.from("orders").select("id,total,status,created_at,items").order("created_at", { ascending: false }).limit(8),
      ]);
      const profiles = profilesRes.data ?? [];
      let t1 = 0, t2 = 0, t3 = 0;
      profiles.forEach(p => {
        if (!p.due_date) return;
        const w = getCurrentWeek(p.due_date);
        if (w <= 13) t1++; else if (w <= 26) t2++; else t3++;
      });
      setMetrics({
        totalUsers: profilesRes.count ?? 0, newThisWeek: newUsersRes.count ?? 0,
        revenueToday: (revTodayRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0),
        revenueAllTime: (revAllRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0),
        pendingOrders: pendingRes.count ?? 0, premiumCount: premiumRes.count ?? 0,
        t1, t2, t3,
      });
      setRecentOrders((recentRes.data ?? []) as RecentOrder[]);
    })();
  }, []);

  const trimTotal = (metrics?.t1 ?? 0) + (metrics?.t2 ?? 0) + (metrics?.t3 ?? 0);

  return (
    <div>
      <PageTitle title="Mission Control" right={
        <span style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 10px rgba(34,197,94,0.9)", display:"inline-block" }} />
          <span style={{ ...fontUI, fontSize:11, color:"#22c55e", fontWeight:700, letterSpacing:1 }}>LIVE</span>
        </span>
      } />

      {/* Metrics row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:18 }}>
        <MetricCard label="Total Users" value={metrics?.totalUsers ?? "—"} delta={metrics ? `+${metrics.newThisWeek} this week` : undefined} />
        <MetricCard label="Premium Members" value={metrics?.premiumCount ?? "—"} />
        <Card style={{ background: newOrderFlash ? "rgba(232,112,42,0.1)" : undefined, border: newOrderFlash ? "1px solid rgba(232,112,42,0.35)" : undefined, transition:"background 0.6s,border 0.6s" }}>
          <Label>Revenue Today</Label>
          <div style={{ ...fontTitle as any, fontSize:30, color: newOrderFlash ? C.orange : C.white, marginTop:4, transition:"color 0.6s", lineHeight:1.1 }}>
            {metrics ? fmtUSD(metrics.revenueToday) : "—"}
          </div>
          <p style={{ ...fontUI, fontSize:11, color:"#444", margin:"4px 0 0" }}>all-time: {metrics ? fmtUSD(metrics.revenueAllTime) : "—"}</p>
        </Card>
        <Card style={{ border: metrics?.pendingOrders ? "1px solid rgba(255,140,66,0.25)" : undefined }}>
          <Label>Pending Orders</Label>
          <div style={{ ...fontTitle as any, fontSize:30, color: metrics?.pendingOrders ? C.orange : C.white, marginTop:4, lineHeight:1.1 }}>{metrics?.pendingOrders ?? "—"}</div>
          <p style={{ ...fontUI, fontSize:11, color:"#444", margin:"4px 0 0" }}>awaiting fulfillment</p>
        </Card>
      </div>

      {/* Trimester breakdown + live feed */}
      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:12, marginBottom:18 }}>
        <Card>
          <p style={{ ...fontUI, fontSize:10, fontWeight:700, letterSpacing:1.2, color:"#444", textTransform:"uppercase", margin:"0 0 16px" }}>Users by Trimester</p>
          {[
            { label:"T1 · Weeks 1–13", count: metrics?.t1 ?? 0, color:"#C8A060" },
            { label:"T2 · Weeks 14–26", count: metrics?.t2 ?? 0, color: C.orange },
            { label:"T3 · Weeks 27–40", count: metrics?.t3 ?? 0, color:"#C85818" },
          ].map(({ label, count, color }) => {
            const pct = trimTotal > 0 ? Math.round((count / trimTotal) * 100) : 0;
            return (
              <div key={label} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ ...fontUI, fontSize:12, color:"#888" }}>{label}</span>
                  <span style={{ ...fontUI, fontSize:12, color, fontWeight:700 }}>{count} <span style={{ color:"#444", fontWeight:400 }}>({pct}%)</span></span>
                </div>
                <div style={{ height:5, background:"#1c1c1c", borderRadius:3 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 1s ease" }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", flexShrink:0 }} />
            <p style={{ ...fontUI, fontSize:10, fontWeight:700, letterSpacing:1.2, color:"#444", textTransform:"uppercase", margin:0 }}>Live Activity Feed</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:1, maxHeight:220, overflowY:"auto" }}>
            {events.length === 0 && <p style={{ ...fontUI, fontSize:12, color:"#333", padding:"10px 0" }}>Waiting for activity…</p>}
            {events.map((e, i) => (
              <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:7, background: i === 0 ? "rgba(255,255,255,0.04)" : "transparent", transition:"background 0.3s" }}>
                <span style={{ fontSize:14, flexShrink:0 }}>{e.icon}</span>
                <span style={{ ...fontUI, fontSize:12, color: i === 0 ? "#ddd" : "#777", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.message}</span>
                <span style={{ ...fontUI, fontSize:10, color:"#3a3a3a", flexShrink:0 }}>{ago(e.at)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <p style={{ ...fontUI, fontSize:10, fontWeight:700, letterSpacing:1.2, color:"#444", textTransform:"uppercase", margin:"0 0 14px" }}>Recent Orders</p>
        {recentOrders.length === 0
          ? <p style={{ ...fontUI, fontSize:13, color:"#333", textAlign:"center", padding:"20px 0" }}>No orders yet</p>
          : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{["Order","Items","Total","Status","When"].map(h => (
                <th key={h} style={{ ...fontUI, fontSize:10, fontWeight:700, color:"#3a3a3a", textAlign:"left", paddingBottom:10, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} style={{ borderTop:`1px solid ${C.border}` }}>
                  <td style={{ ...fontUI, fontSize:11, color:"#555", padding:"10px 12px 10px 0", fontFamily:"monospace" }}>{o.id.slice(0,8)}…</td>
                  <td style={{ ...fontUI, fontSize:12, color:"#888", padding:"10px 12px 10px 0" }}>{Array.isArray(o.items)?o.items.length:0}</td>
                  <td style={{ ...fontUI, fontSize:13, color:C.orange, fontWeight:700, padding:"10px 12px 10px 0" }}>{fmtUSD(Number(o.total))}</td>
                  <td style={{ padding:"10px 12px 10px 0" }}>
                    <StatusPill tone={o.status==="paid"?"success":o.status==="shipped"?"info":o.status==="delivered"?"success":"warning"}>{o.status}</StatusPill>
                  </td>
                  <td style={{ ...fontUI, fontSize:11, color:"#444" }}>{ago(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
