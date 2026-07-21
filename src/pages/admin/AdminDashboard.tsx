import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SceneBackground, GlassCard } from "@/components/golden";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Flag,
  LayoutGrid,
  LifeBuoy,
  MessageCircle,
  MessageSquareWarning,
  Package,
  RefreshCw,
  Truck,
  UserPlus,
} from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE = 1000; // PostgREST per-request row cap
const MAX_PAGES = 10;

/** Local-midnight timestamp for N days ago (0 = today). */
const dayStart = (daysAgo: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime() - daysAgo * DAY_MS;
};
const dayKey = (iso: string) => {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Fetch (user_id, created_at) pages until a short page or the cap. */
async function fetchAllPages(
  table: "profiles" | "chat_messages",
  columns: string,
  filter?: (q: any) => any
): Promise<any[]> {
  const rows: any[] = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    let q = supabase.from(table).select(columns).order("created_at", { ascending: false }).range(p * PAGE, (p + 1) * PAGE - 1);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error || !data) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

interface DashData {
  profiles: { user_id: string; first_name: string | null; created_at: string; onboarding_completed: boolean }[];
  chatRows: { user_id: string; created_at: string }[];
  activityRows: { user_id: string; created_at: string }[]; // chat + posts + comments, last 7d
  recentOrders: { id: string; total: number; status: string; created_at: string; items: unknown }[];
  recentPosts: { id: string; title: string; category: string; display_name: string | null; created_at: string }[];
  paid7dTotals: number[];
  openTickets: { id: string; subject: string; status: string; priority: string; created_at: string }[];
  openTicketCount: number;
  flaggedPosts: number;
  flaggedChats: number;
  unshippedPaid: number;
}

async function loadDashboard(): Promise<DashData> {
  const sevenDaysAgo = new Date(dayStart(6)).toISOString();
  const [
    profiles,
    chatRows,
    posts7d,
    comments7d,
    recentOrders,
    recentPosts,
    paidOrders7d,
    tickets,
    flaggedPosts,
    flaggedChats,
    unshippedPaid,
  ] = await Promise.all([
    fetchAllPages("profiles", "user_id, first_name, created_at, onboarding_completed"),
    fetchAllPages("chat_messages", "user_id, created_at", (q) => q.eq("role", "user")),
    supabase.from("posts").select("user_id, created_at").gte("created_at", sevenDaysAgo).limit(PAGE),
    supabase.from("comments").select("user_id, created_at").gte("created_at", sevenDaysAgo).limit(PAGE),
    supabase.from("orders").select("id, total, status, created_at, items").order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("id, user_id, title, category, display_name, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("total").eq("status", "paid").gte("created_at", sevenDaysAgo),
    supabase
      .from("support_tickets")
      .select("id, subject, status, priority, created_at", { count: "exact" })
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("is_flagged", true),
    supabase.from("chat_messages").select("id", { count: "exact", head: true }).eq("is_flagged", true).is("reviewed_at", null),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid").is("shipped_at", null),
  ]);

  const chat7d = chatRows.filter((r) => new Date(r.created_at).getTime() >= dayStart(6));
  return {
    profiles,
    chatRows,
    activityRows: [...chat7d, ...(posts7d.data ?? []), ...(comments7d.data ?? [])],
    recentOrders: (recentOrders.data ?? []) as DashData["recentOrders"],
    recentPosts: (recentPosts.data ?? []) as DashData["recentPosts"],
    paid7dTotals: (paidOrders7d.data ?? []).map((o: { total: number }) => o.total),
    openTickets: (tickets.data ?? []) as DashData["openTickets"],
    openTicketCount: tickets.count ?? 0,
    flaggedPosts: flaggedPosts.count ?? 0,
    flaggedChats: flaggedChats.count ?? 0,
    unshippedPaid: unshippedPaid.count ?? 0,
  };
}

/** Per-day counts for the last 7 local days (oldest → today). */
function dailyBuckets(rows: { created_at: string }[], distinctBy?: (r: any) => string): number[] {
  const buckets = Array.from({ length: 7 }, (_, i) => dayStart(6 - i));
  return buckets.map((start) => {
    const inDay = rows.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= start && t < start + DAY_MS;
    });
    if (!distinctBy) return inDay.length;
    return new Set(inDay.map(distinctBy)).size;
  });
}

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

const cream60 = "rgba(251,238,224,0.6)";
const cream75 = "rgba(251,238,224,0.75)";

/** 7-day mini bar trend — single series; last (today) bar direct-labeled. */
function TrendBars({ values, color, label }: { values: number[]; color: string; label: string }) {
  const max = Math.max(1, ...values);
  const dayName = (i: number) =>
    new Date(dayStart(6 - i)).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return (
    <div role="img" aria-label={`${label}, last 7 days: ${values.join(", ")}`} style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 44, marginTop: 12 }}>
      {values.map((v, i) => (
        <div key={i} title={`${dayName(i)}: ${v}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          {i === values.length - 1 && (
            <span className="font-gh-mono" style={{ fontSize: 9, color: cream75, lineHeight: 1 }}>{v}</span>
          )}
          <div
            style={{
              width: "100%",
              height: Math.max(3, Math.round((v / max) * 32)),
              borderRadius: "4px 4px 2px 2px",
              background: i === values.length - 1 ? color : `color-mix(in srgb, ${color} 55%, transparent)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(242,182,71,0.85)",
  marginBottom: 4,
};

const heroNum: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 40,
  fontWeight: 500,
  lineHeight: 1,
  color: "var(--cream)",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [data, setData] = useState<DashData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setData(await loadDashboard());
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const m = useMemo(() => {
    if (!data) return null;
    const todayStart = dayStart(0);
    const week = dayStart(6);
    const prevWeek = dayStart(13);
    const created = (r: { created_at: string }) => new Date(r.created_at).getTime();

    const signupsToday = data.profiles.filter((p) => created(p) >= todayStart).length;
    const signups7d = data.profiles.filter((p) => created(p) >= week).length;
    const signupsPrev7d = data.profiles.filter((p) => created(p) >= prevWeek && created(p) < week).length;

    const messagedEver = new Set(data.chatRows.map((r) => r.user_id));
    const activated = data.profiles.filter((p) => p.onboarding_completed && messagedEver.has(p.user_id)).length;
    const activationPct = data.profiles.length > 0 ? Math.round((activated / data.profiles.length) * 100) : 0;

    const messages7d = data.chatRows.filter((r) => created(r) >= week).length;
    const dauBars = dailyBuckets(data.activityRows, (r) => r.user_id);
    const dauToday = dauBars[dauBars.length - 1];
    const signupBars = dailyBuckets(data.profiles.filter((p) => created(p) >= week));
    const shopRevenue7d = data.paid7dTotals.reduce((s, t) => s + t, 0);

    const nameOf = new Map(data.profiles.map((p) => [p.user_id, p.first_name || "Mama"]));
    const feed = [
      ...data.profiles.slice(0, 5).map((p) => ({
        key: `u-${p.user_id}`, at: p.created_at, icon: "signup" as const,
        text: `${p.first_name || "New mama"} signed up`,
      })),
      ...data.recentOrders.map((o) => ({
        key: `o-${o.id}`, at: o.created_at, icon: "order" as const,
        text: `Order $${Number(o.total).toFixed(2)} · ${o.status}`,
      })),
      ...data.recentPosts.map((p) => ({
        key: `p-${p.id}`, at: p.created_at, icon: "post" as const,
        text: `${p.display_name || nameOf.get((p as any).user_id) || "A mama"} posted "${p.title}"`,
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 10);

    return { signupsToday, signups7d, signupsPrev7d, activationPct, activated, messages7d, dauBars, dauToday, signupBars, shopRevenue7d, feed, totalUsers: data.profiles.length };
  }, [data]);

  const needsYou = data
    ? [
        { count: data.openTicketCount, label: "open support tickets", icon: LifeBuoy, to: "/admin/support" },
        { count: data.flaggedPosts, label: "flagged community posts", icon: Flag, to: "/admin/community" },
        { count: data.flaggedChats, label: "flagged chats to review", icon: MessageSquareWarning, to: "/admin/chats" },
        { count: data.unshippedPaid, label: "paid orders to ship", icon: Truck, to: "/admin/orders" },
      ].filter((n) => n.count > 0)
    : [];

  const firstName = profile?.first_name || "founder";
  const dateLine = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const iconFor = (kind: "signup" | "order" | "post") =>
    kind === "signup" ? <UserPlus size={14} strokeWidth={1.8} color="var(--gold)" />
    : kind === "order" ? <Package size={14} strokeWidth={1.8} color="var(--magenta)" />
    : <MessageCircle size={14} strokeWidth={1.8} color="var(--teal)" />;

  const delta = m ? m.signups7d - m.signupsPrev7d : 0;

  return (
    <SceneBackground scene="today">
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "18px 16px 48px", fontFamily: "'Inter', system-ui, sans-serif", color: "var(--cream)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="gh-brand" style={{ fontSize: 22 }}>belly</div>
            <div className="gh-brand-tag">founder cockpit</div>
            <div className="font-gh-serif" style={{ fontSize: 17, marginTop: 10, fontStyle: "italic", color: cream75 }}>
              Morning, {firstName} — {dateLine}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="gh-icon-btn" aria-label="Back to app" onClick={() => navigate("/")}>
              <ArrowLeft size={15} strokeWidth={1.8} />
            </button>
            <button className="gh-icon-btn" aria-label="Refresh" onClick={load} disabled={refreshing}>
              <RefreshCw size={14} strokeWidth={1.8} className={refreshing ? "animate-spin" : undefined} />
            </button>
          </div>
        </div>

        {!data || !m ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <>
            {/* NEEDS YOU */}
            <GlassCard>
              <div style={sectionLabel}>needs you</div>
              {needsYou.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 6 }}>
                  <CheckCircle2 size={17} strokeWidth={1.8} color="var(--teal)" />
                  <span style={{ fontSize: 13.5, color: cream75 }}>All clear — nothing needs you right now.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                  {needsYou.map(({ count, label, icon: Icon, to }) => (
                    <button
                      key={to}
                      onClick={() => navigate(to)}
                      className="belly-btn-press"
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                        background: "rgba(232,98,46,0.14)", border: "1px solid rgba(232,98,46,0.35)",
                        borderRadius: 12, padding: "10px 12px", color: "var(--cream)", cursor: "pointer",
                      }}
                    >
                      <Icon size={15} strokeWidth={1.8} color="var(--ember)" style={{ flexShrink: 0 }} />
                      <span className="font-gh-mono" style={{ fontSize: 15, color: "var(--gold)" }}>{count}</span>
                      <span style={{ fontSize: 13, flex: 1 }}>{label}</span>
                      <ChevronRight size={15} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Three signals */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              <GlassCard style={{ marginBottom: 0 }}>
                <div style={sectionLabel}>coming in</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={heroNum}>{m.signupsToday}</span>
                  <span style={{ fontSize: 12.5, color: cream60 }}>signups today</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12.5, color: cream75 }}>
                  <span><b style={{ color: "var(--cream)", fontWeight: 600 }}>{m.signups7d}</b> this week</span>
                  <span
                    className="font-gh-mono"
                    style={{
                      fontSize: 10.5, padding: "2px 8px", borderRadius: 10,
                      background: delta >= 0 ? "rgba(44,156,143,0.18)" : "rgba(232,98,46,0.18)",
                      border: `1px solid ${delta >= 0 ? "rgba(44,156,143,0.4)" : "rgba(232,98,46,0.4)"}`,
                      color: delta >= 0 ? "#7fe0d3" : "#ffb187",
                    }}
                  >
                    {delta >= 0 ? "+" : ""}{delta} vs prior week
                  </span>
                </div>
                <TrendBars values={m.signupBars} color="var(--gold)" label="Daily signups" />
              </GlassCard>

              <GlassCard style={{ marginBottom: 0 }}>
                <div style={sectionLabel}>using it</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={heroNum}>{m.activationPct}%</span>
                  <span style={{ fontSize: 12.5, color: cream60 }}>activated</span>
                </div>
                <div className="gh-progress-track" style={{ marginTop: 10 }}>
                  <div className="gh-progress-fill" style={{ width: `${m.activationPct}%` }} />
                </div>
                <div style={{ fontSize: 11.5, color: cream60, marginTop: 6 }}>
                  {m.activated} of {m.totalUsers} finished onboarding and messaged Bella
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12.5, color: cream75 }}>
                  <span><b style={{ color: "var(--cream)", fontWeight: 600 }}>{m.dauToday}</b> active today</span>
                  <span><b style={{ color: "var(--cream)", fontWeight: 600 }}>{m.messages7d}</b> Bella msgs · 7d</span>
                </div>
                <TrendBars values={m.dauBars} color="var(--teal)" label="Daily active users (chatted, posted or replied)" />
                <div style={{ fontSize: 9.5, color: "rgba(251,238,224,0.45)", marginTop: 4 }}>
                  active = chatted · posted · replied
                </div>
              </GlassCard>

              <GlassCard style={{ marginBottom: 0 }}>
                <div style={sectionLabel}>money</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(181,56,107,0.2)", border: "1px solid rgba(181,56,107,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <CreditCard size={17} strokeWidth={1.8} color="var(--magenta)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Pro revenue</div>
                    <div style={{ fontSize: 11.5, color: cream60 }}>Stripe connects next session</div>
                  </div>
                </div>
                <span
                  className="font-gh-mono"
                  style={{
                    display: "inline-block", marginTop: 10, fontSize: 10, padding: "3px 10px",
                    borderRadius: 10, border: "1px dashed rgba(251,238,224,0.35)", color: cream60,
                  }}
                >
                  connect Stripe
                </span>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 14, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12.5, color: cream75 }}>Shop orders paid · 7d</span>
                  <span className="font-gh-mono" style={{ fontSize: 16, color: "var(--cream)" }}>${m.shopRevenue7d.toFixed(2)}</span>
                </div>
              </GlassCard>
            </div>

            {/* Activity + quick links */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginTop: 12 }}>
              <GlassCard style={{ marginBottom: 0 }}>
                <div style={sectionLabel}>recent activity</div>
                {m.feed.length === 0 ? (
                  <div style={{ fontSize: 13, color: cream60, marginTop: 6 }}>Nothing yet — it's quiet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
                    {m.feed.map((f) => (
                      <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ flexShrink: 0, display: "inline-flex" }}>{iconFor(f.icon)}</span>
                        <span style={{ fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.text}</span>
                        <span className="font-gh-mono" style={{ fontSize: 10, color: cream60, flexShrink: 0 }}>{relTime(f.at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { to: "/admin/products", icon: Package, title: "Product manager", sub: "shop products, stock, images" },
                  { to: "/admin/orders", icon: LayoutGrid, title: "Full console", sub: "orders, users, support, broadcast" },
                ].map(({ to, icon: Icon, title, sub }) => (
                  <GlassCard key={to} onClick={() => navigate(to)} style={{ marginBottom: 0, cursor: "pointer" }} className="belly-card-interactive">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                          background: "rgba(242,182,71,0.18)", border: "1px solid rgba(242,182,71,0.4)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Icon size={18} strokeWidth={1.8} color="var(--gold)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-gh-serif" style={{ fontSize: 15.5, fontWeight: 500 }}>{title}</div>
                        <div style={{ fontSize: 11.5, color: cream60 }}>{sub}</div>
                      </div>
                      <ChevronRight size={17} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
                    </div>
                  </GlassCard>
                ))}
                <div style={{ fontSize: 10.5, color: "rgba(251,238,224,0.4)", padding: "0 4px" }}>
                  Signed in as {user?.email}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SceneBackground>
  );
};

export default AdminDashboard;
