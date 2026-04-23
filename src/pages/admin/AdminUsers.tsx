import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Btn, C, Card, Empty, Input, PageTitle, Select, SectionTitle,
  SlidePanel, StatusPill, fontTitle, fontUI,
} from "@/components/admin/ui";

type Profile = {
  id: string; user_id: string; first_name: string | null; due_date: string | null;
  pregnancy_number: number | null; is_premium: boolean | null;
  premium_since: string | null; created_at: string; updated_at: string;
};

const weekFromDue = (due: string | null) => {
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  const weeksToGo = Math.max(0, Math.ceil(ms / (7 * 86400000)));
  return Math.max(1, Math.min(40, 40 - weeksToGo));
};
const trimester = (week: number | null) => (week == null ? null : week <= 13 ? 1 : week <= 26 ? 2 : 3);

const AdminUsers = () => {
  const [list, setList] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [trimFilter, setTrimFilter] = useState("all");
  const [premFilter, setPremFilter] = useState("all");
  const [open, setOpen] = useState<Profile | null>(null);
  const [openStats, setOpenStats] = useState<{ chats: any[]; orders: any[]; journal: number; isAdmin: boolean } | null>(null);

  const refresh = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setList((data as Profile[]) ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => list.filter((u) => {
    const w = weekFromDue(u.due_date);
    if (trimFilter !== "all" && trimester(w) !== Number(trimFilter)) return false;
    if (premFilter === "premium" && !u.is_premium) return false;
    if (premFilter === "free" && u.is_premium) return false;
    if (q) {
      const hay = `${u.first_name ?? ""} ${u.user_id}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [list, q, trimFilter, premFilter]);

  const churned = (u: Profile) => Date.now() - new Date(u.updated_at).getTime() > 14 * 86400000;

  const openUser = async (u: Profile) => {
    setOpen(u); setOpenStats(null);
    const [chats, orders, journal, role] = await Promise.all([
      supabase.from("chat_messages").select("role, content, created_at").eq("user_id", u.user_id).order("created_at", { ascending: false }).limit(5),
      supabase.from("orders").select("id, total, status, created_at").eq("user_id", u.user_id).order("created_at", { ascending: false }).limit(3),
      supabase.from("journal_entries").select("*", { count: "exact", head: true }).eq("user_id", u.user_id),
      supabase.from("user_roles").select("role").eq("user_id", u.user_id).eq("role", "admin").maybeSingle(),
    ]);
    setOpenStats({ chats: chats.data ?? [], orders: orders.data ?? [], journal: journal.count ?? 0, isAdmin: !!role.data });
  };

  const togglePremium = async (u: Profile) => {
    await supabase.from("profiles").update({
      is_premium: !u.is_premium,
      premium_since: !u.is_premium ? new Date().toISOString() : null,
    }).eq("user_id", u.user_id);
    refresh();
    openUser({ ...u, is_premium: !u.is_premium });
  };

  const toggleAdmin = async (u: Profile) => {
    if (!openStats) return;
    if (openStats.isAdmin) await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", "admin");
    else await supabase.from("user_roles").insert({ user_id: u.user_id, role: "admin" });
    openUser(u);
  };

  return (
    <>
      <PageTitle title="All Users" />
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Input placeholder="Search by name or ID…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        <Select value={trimFilter} onChange={(e) => setTrimFilter(e.target.value)}>
          <option value="all">All trimesters</option>
          <option value="1">1st trimester</option><option value="2">2nd trimester</option><option value="3">3rd trimester</option>
        </Select>
        <Select value={premFilter} onChange={(e) => setPremFilter(e.target.value)}>
          <option value="all">All members</option>
          <option value="premium">Premium only</option><option value="free">Free only</option>
        </Select>
      </div>
      <Card padding={0}>
        {filtered.length === 0 ? <Empty>No users match.</Empty> : (
          <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
            <thead><tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {["", "Name", "Week", "Due", "Joined", "Last active", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontWeight: 700 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((u) => {
                const w = weekFromDue(u.due_date);
                const isChurned = churned(u);
                return (
                  <tr key={u.user_id} onClick={() => openUser(u)} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer" }}>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,140,66,0.15)", color: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        {(u.first_name ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                    </td>
                    <td style={{ padding: "12px 18px", color: "#fff" }}>{u.first_name ?? <span style={{ color: C.muted }}>(unnamed)</span>}</td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>{w ? `${w}w` : "—"}</td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>{u.due_date ? new Date(u.due_date).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 18px", color: "#888" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 18px", color: "#888" }}>{new Date(u.updated_at).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 18px" }}>
                      {u.is_premium ? <StatusPill tone="premium">Premium</StatusPill> : isChurned ? <StatusPill tone="danger">Churned</StatusPill> : <StatusPill tone="neutral">Free</StatusPill>}
                    </td>
                    <td style={{ padding: "12px 18px", color: C.muted }}>›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <SlidePanel open={!!open} onClose={() => setOpen(null)} title={open?.first_name ?? "User"} width={560}>
        {open && (
          <div style={{ ...fontUI, color: "#ddd", fontSize: 13, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,140,66,0.15)", color: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 }}>
                {(open.first_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p style={{ ...fontTitle, fontSize: 22, color: "#fff", margin: 0 }}>{open.first_name ?? "(unnamed)"}</p>
                <p style={{ margin: "4px 0", fontSize: 12, color: C.muted, fontFamily: "monospace" }}>{open.user_id.slice(0, 16)}…</p>
                {open.is_premium && <StatusPill tone="premium">Premium since {open.premium_since ? new Date(open.premium_since).toLocaleDateString() : "—"}</StatusPill>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Card padding={12}><p style={{ margin: 0, fontSize: 10, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>Week</p><p style={{ ...fontTitle, fontSize: 22, color: "#fff", margin: "4px 0 0" }}>{weekFromDue(open.due_date) ?? "—"}</p></Card>
              <Card padding={12}><p style={{ margin: 0, fontSize: 10, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>Pregnancy</p><p style={{ ...fontTitle, fontSize: 22, color: "#fff", margin: "4px 0 0" }}>#{open.pregnancy_number ?? 1}</p></Card>
              <Card padding={12}><p style={{ margin: 0, fontSize: 10, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>Journal</p><p style={{ ...fontTitle, fontSize: 22, color: "#fff", margin: "4px 0 0" }}>{openStats?.journal ?? "—"}</p></Card>
            </div>
            <div><SectionTitle>Last 5 Doula messages</SectionTitle>
              {!openStats ? <Empty>Loading…</Empty> : openStats.chats.length === 0 ? <Empty>No messages</Empty> : openStats.chats.map((c, i) => (
                <div key={i} style={{ borderTop: `1px solid ${C.border}`, padding: "8px 0" }}>
                  <p style={{ margin: 0, fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{c.role} · {new Date(c.created_at).toLocaleString()}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: c.role === "user" ? "#fff" : "#bbb" }}>{String(c.content).slice(0, 200)}</p>
                </div>
              ))}
            </div>
            <div><SectionTitle>Last 3 orders</SectionTitle>
              {!openStats ? <Empty>Loading…</Empty> : openStats.orders.length === 0 ? <Empty>No orders</Empty> : openStats.orders.map((o) => (
                <div key={o.id} style={{ borderTop: `1px solid ${C.border}`, padding: "8px 0", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11 }}>#{o.id.slice(0, 8)}</span>
                  <span style={{ color: "#888" }}>{new Date(o.created_at).toLocaleDateString()}</span>
                  <span style={{ color: C.orange }}>${Number(o.total).toFixed(2)}</span>
                  <StatusPill tone={o.status === "paid" ? "success" : o.status === "pending" ? "warning" : "neutral"}>{o.status}</StatusPill>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn onClick={() => togglePremium(open)}>{open.is_premium ? "Revoke Premium" : "Grant Premium"}</Btn>
              <Btn variant="secondary" onClick={() => toggleAdmin(open)}>{openStats?.isAdmin ? "Remove Admin" : "Make Admin"}</Btn>
            </div>
          </div>
        )}
      </SlidePanel>
    </>
  );
};

export default AdminUsers;
