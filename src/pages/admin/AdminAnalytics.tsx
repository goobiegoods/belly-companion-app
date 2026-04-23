import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { C, Card, Empty, PageTitle, SectionTitle, fontTitle, fontUI } from "@/components/admin/ui";

const MOOD_COLORS = ["#FF8C42", "#22c55e", "#3b82f6", "#a855f7", "#ef4444", "#eab308"];
const PLAN_COLORS = [C.orange, C.premium];

const AdminAnalytics = () => {
  const [growth, setGrowth] = useState<{ day: string; signups: number; premium: number }[]>([]);
  const [moodPie, setMoodPie] = useState<{ name: string; value: number }[]>([]);
  const [streakHist, setStreakHist] = useState<{ bucket: string; count: number }[]>([]);
  const [avgMsgs, setAvgMsgs] = useState(0);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<{ word: string; count: number }[]>([]);
  const [planSplit, setPlanSplit] = useState<{ name: string; value: number }[]>([]);
  const [skuRevenue, setSkuRevenue] = useState<{ sku: string; revenue: number }[]>([]);
  const [promoUse, setPromoUse] = useState<{ code: string; uses: number }[]>([]);

  useEffect(() => {
    (async () => {
      const thirty = new Date();
      thirty.setDate(thirty.getDate() - 30);

      const [profs, prems, moods, streaks, msgs, posts, chats, subs, orders, promos] = await Promise.all([
        supabase.from("profiles").select("created_at").gte("created_at", thirty.toISOString()),
        supabase.from("profiles").select("premium_since").not("premium_since", "is", null).gte("premium_since", thirty.toISOString()),
        supabase.from("mood_logs").select("mood"),
        supabase.from("streak_state").select("current_streak"),
        supabase.from("chat_messages").select("user_id"),
        supabase.from("posts").select("id, title, likes, display_name").order("likes", { ascending: false }).limit(5),
        supabase.from("chat_messages").select("content").eq("role", "user").order("created_at", { ascending: false }).limit(500),
        supabase.from("subscriptions").select("price_id, status"),
        supabase.from("orders").select("items, total").eq("status", "paid"),
        supabase.from("promo_codes").select("code, current_uses").gt("current_uses", 0).order("current_uses", { ascending: false }).limit(10),
      ]);

      // growth
      const days: Record<string, { signups: number; premium: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[d.toISOString().slice(0, 10)] = { signups: 0, premium: 0 };
      }
      (profs.data ?? []).forEach((p: any) => {
        const k = String(p.created_at).slice(0, 10);
        if (days[k]) days[k].signups++;
      });
      (prems.data ?? []).forEach((p: any) => {
        const k = String(p.premium_since).slice(0, 10);
        if (days[k]) days[k].premium++;
      });
      setGrowth(Object.entries(days).map(([day, v]) => ({ day: day.slice(5), ...v })));

      // moods
      const moodCounts: Record<string, number> = {};
      (moods.data ?? []).forEach((m: any) => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
      });
      setMoodPie(Object.entries(moodCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6));

      // streaks
      const buckets = { "0": 0, "1–3": 0, "4–7": 0, "8–14": 0, "15+": 0 };
      (streaks.data ?? []).forEach((s: any) => {
        const v = s.current_streak;
        if (v === 0) buckets["0"]++;
        else if (v <= 3) buckets["1–3"]++;
        else if (v <= 7) buckets["4–7"]++;
        else if (v <= 14) buckets["8–14"]++;
        else buckets["15+"]++;
      });
      setStreakHist(Object.entries(buckets).map(([bucket, count]) => ({ bucket, count })));

      // avg messages per user
      const totals: Record<string, number> = {};
      (msgs.data ?? []).forEach((m: any) => {
        totals[m.user_id] = (totals[m.user_id] || 0) + 1;
      });
      const userCount = Object.keys(totals).length;
      const totalMsgs = (msgs.data ?? []).length;
      setAvgMsgs(userCount ? +(totalMsgs / userCount).toFixed(1) : 0);

      setTopPosts(posts.data ?? []);

      // keyword cluster (simple)
      const stop = new Set(["the", "and", "for", "with", "you", "your", "are", "this", "that", "have", "what", "when", "from", "about", "can", "should", "i", "im", "is", "it", "to", "a", "of", "my", "in", "on", "be"]);
      const wc: Record<string, number> = {};
      (chats.data ?? []).forEach((c: any) => {
        String(c.content).toLowerCase().split(/[^a-z]+/).forEach((w) => {
          if (w.length < 4 || stop.has(w)) return;
          wc[w] = (wc[w] || 0) + 1;
        });
      });
      setKeywords(
        Object.entries(wc)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word, count]) => ({ word, count }))
      );

      // plan split (very rough — by price_id contains 'annual')
      let monthly = 0;
      let annual = 0;
      (subs.data ?? []).forEach((s: any) => {
        if (s.status !== "active" && s.status !== "trialing") return;
        if (String(s.price_id).toLowerCase().includes("annual") || String(s.price_id).toLowerCase().includes("year")) annual++;
        else monthly++;
      });
      setPlanSplit([
        { name: "Monthly", value: monthly },
        { name: "Annual", value: annual },
      ]);

      // sku revenue
      const sku: Record<string, number> = {};
      (orders.data ?? []).forEach((o: any) => {
        const items = Array.isArray(o.items) ? o.items : [];
        items.forEach((it: any) => {
          const name = it.name ?? it.id ?? "Unknown";
          sku[name] = (sku[name] || 0) + Number(it.price ?? 0) * Number(it.qty ?? 1);
        });
      });
      setSkuRevenue(
        Object.entries(sku)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([s, r]) => ({ sku: s.length > 22 ? s.slice(0, 20) + "…" : s, revenue: Math.round(r * 100) / 100 }))
      );

      setPromoUse((promos.data ?? []).map((p: any) => ({ code: p.code, uses: p.current_uses })));
    })();
  }, []);

  return (
    <>
      <PageTitle title="Analytics" />

      <SectionTitle>User growth · last 30 days</SectionTitle>
      <Card padding={20} style={{ marginBottom: 22 }}>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="day" stroke="#444" style={{ ...fontUI, fontSize: 10 }} />
              <YAxis stroke="#444" style={{ ...fontUI, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0c0c0c", border: `1px solid ${C.border}`, fontFamily: "Outfit", fontSize: 12 }} />
              <Line type="monotone" dataKey="signups" stroke={C.orange} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="premium" stroke={C.premium} strokeWidth={2} strokeDasharray="4 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>Engagement</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
        <Card>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>Avg msgs / user</p>
          <p style={{ ...fontTitle, fontSize: 32, color: "#fff", margin: "6px 0" }}>{avgMsgs}</p>
        </Card>
        <Card>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Mood distribution</p>
          {moodPie.length === 0 ? <Empty>No data</Empty> : (
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={moodPie} dataKey="value" nameKey="name" outerRadius={55} innerRadius={28}>
                    {moodPie.map((_, i) => <Cell key={i} fill={MOOD_COLORS[i % MOOD_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0c0c0c", border: `1px solid ${C.border}`, fontFamily: "Outfit", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Streak distribution</p>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <BarChart data={streakHist}>
                <XAxis dataKey="bucket" stroke="#444" style={{ ...fontUI, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0c0c0c", border: `1px solid ${C.border}`, fontFamily: "Outfit", fontSize: 11 }} cursor={{ fill: "rgba(255,140,66,0.06)" }} />
                <Bar dataKey="count" fill={C.orange} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <SectionTitle>Top content</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <Card padding={20}>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Most-liked posts</p>
          {topPosts.length === 0 ? <Empty>No posts</Empty> : topPosts.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.border}` }}>
              <span style={{ ...fontUI, fontSize: 12, color: "#ddd", maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
              <span style={{ ...fontUI, fontSize: 12, color: C.orange }}>♥ {p.likes}</span>
            </div>
          ))}
        </Card>
        <Card padding={20}>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Top doula keywords</p>
          {keywords.length === 0 ? <Empty>No data</Empty> : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {keywords.map((k) => (
                <span key={k.word} style={{ ...fontUI, fontSize: 11, padding: "4px 9px", borderRadius: 14, background: "rgba(255,140,66,0.08)", color: "#eaeaea", border: `1px solid ${C.border}` }}>
                  {k.word} <span style={{ color: C.orange }}>· {k.count}</span>
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      <SectionTitle>Revenue breakdown</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Revenue by SKU</p>
          {skuRevenue.length === 0 ? <Empty>No paid orders yet</Empty> : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={skuRevenue} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
                  <XAxis type="number" stroke="#444" style={{ ...fontUI, fontSize: 10 }} />
                  <YAxis type="category" dataKey="sku" stroke="#444" style={{ ...fontUI, fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={{ background: "#0c0c0c", border: `1px solid ${C.border}`, fontFamily: "Outfit", fontSize: 11 }} cursor={{ fill: "rgba(255,140,66,0.06)" }} />
                  <Bar dataKey="revenue" fill={C.orange} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card padding={20}>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Plan split</p>
          {planSplit.every((p) => p.value === 0) ? <Empty>No subscribers</Empty> : (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={planSplit} dataKey="value" nameKey="name" outerRadius={70} innerRadius={36}>
                    {planSplit.map((_, i) => <Cell key={i} fill={PLAN_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0c0c0c", border: `1px solid ${C.border}`, fontFamily: "Outfit", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card padding={20}>
          <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Promo usage</p>
          {promoUse.length === 0 ? <Empty>No redemptions yet</Empty> : promoUse.map((p) => (
            <div key={p.code} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
              <span style={{ ...fontUI, fontSize: 12, color: "#ddd", fontFamily: "monospace" }}>{p.code}</span>
              <span style={{ ...fontUI, fontSize: 12, color: C.orange }}>{p.uses}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
};

export default AdminAnalytics;
