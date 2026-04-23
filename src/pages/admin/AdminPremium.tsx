import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  C,
  Card,
  Empty,
  MetricCard,
  PageTitle,
  StatusPill,
  TabBar,
  fontUI,
} from "@/components/admin/ui";

type Profile = {
  user_id: string;
  first_name: string | null;
  is_premium: boolean | null;
  premium_since: string | null;
  premium_expires_at: string | null;
  updated_at: string;
};

type Sub = {
  user_id: string;
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
};

const TABS = [
  { id: "active", label: "Active" },
  { id: "atrisk", label: "At-risk" },
  { id: "churned", label: "Churned" },
];

const planFor = (price_id: string) => /annual|year/i.test(price_id) ? "Annual" : "Monthly";
const mrrFor = (price_id: string) => /annual|year/i.test(price_id) ? 9.99 * 0.7 : 9.99;

const daysSince = (iso: string | null) => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null;

const AdminPremium = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    (async () => {
      const [u, s] = await Promise.all([
        supabase.from("profiles").select("user_id, first_name, is_premium, premium_since, premium_expires_at, updated_at").eq("is_premium", true),
        supabase.from("subscriptions").select("user_id, status, price_id, current_period_end, cancel_at_period_end"),
      ]);
      setUsers((u.data as Profile[]) ?? []);
      setSubs((s.data as Sub[]) ?? []);
    })();
  }, []);

  const subFor = (uid: string) => subs.find((s) => s.user_id === uid);

  const buckets = useMemo(() => {
    const active: Profile[] = [];
    const atrisk: Profile[] = [];
    const churned: Profile[] = [];
    users.forEach((u) => {
      const days = daysSince(u.updated_at);
      const expired = u.premium_expires_at && new Date(u.premium_expires_at) < new Date();
      if (expired) churned.push(u);
      else if (days != null && days >= 7) atrisk.push(u);
      else active.push(u);
    });
    return { active, atrisk, churned };
  }, [users]);

  const visible = (buckets as any)[tab] as Profile[];

  const mrr = users.reduce((s, u) => {
    const sub = subFor(u.user_id);
    return s + (sub ? mrrFor(sub.price_id) : 9.99);
  }, 0);
  const arr = mrr * 12;

  return (
    <>
      <PageTitle title="Premium Members" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <MetricCard label="Premium members" value={users.length} />
        <MetricCard label="MRR" value={`$${mrr.toFixed(0)}`} />
        <MetricCard label="ARR projected" value={`$${arr.toFixed(0)}`} />
        <MetricCard label="At-risk" value={buckets.atrisk.length} delta={buckets.atrisk.length > 0 ? "Re-engage" : "Healthy"} deltaTone={buckets.atrisk.length > 0 ? "warning" : "success"} />
      </div>

      <TabBar tabs={TABS.map((t) => ({ ...t, count: (buckets as any)[t.id].length }))} value={tab} onChange={setTab} />

      <Card padding={0}>
        {visible.length === 0 ? <Empty>No users in this bucket.</Empty> : (
          <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
            <thead>
              <tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                {["Name", "Plan", "Since", "Renews", "MRR", "Risk"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const s = subFor(u.user_id);
                const days = daysSince(u.updated_at);
                const risk = days == null ? "—" : days >= 7 ? "High" : days >= 3 ? "Medium" : "Low";
                const tone = risk === "High" ? "danger" : risk === "Medium" ? "warning" : "success";
                return (
                  <tr key={u.user_id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 18px", color: "#fff" }}>{u.first_name ?? "(unnamed)"}</td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>{s ? planFor(s.price_id) : "—"}</td>
                    <td style={{ padding: "12px 18px", color: "#888" }}>{u.premium_since ? new Date(u.premium_since).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 18px", color: "#888" }}>{s?.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 18px", color: C.orange }}>${(s ? mrrFor(s.price_id) : 9.99).toFixed(2)}</td>
                    <td style={{ padding: "12px 18px" }}><StatusPill tone={tone as any}>{risk}</StatusPill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
};

export default AdminPremium;
