import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Btn, C, Card, Empty, PageTitle, StatusPill, TabBar, fontUI,
} from "@/components/admin/ui";

type Post = {
  id: string; user_id: string; title: string; body: string; category: string;
  display_name: string | null; likes: number; is_pinned: boolean;
  is_featured: boolean; is_flagged: boolean; flag_reason: string | null;
  created_at: string; week_posted: number | null;
};

const TABS = [
  { id: "all", label: "All" }, { id: "pinned", label: "Pinned" }, { id: "flagged", label: "Flagged" },
  { id: "question", label: "Questions" }, { id: "story", label: "Stories" },
  { id: "tip", label: "Tips" }, { id: "support", label: "Support" },
];

const AdminCommunity = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState("all");

  const refresh = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => posts.filter((p) => {
    if (tab === "all") return true;
    if (tab === "pinned") return p.is_pinned;
    if (tab === "flagged") return p.is_flagged;
    return p.category === tab;
  }), [posts, tab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: posts.length, pinned: 0, flagged: 0 };
    posts.forEach((p) => {
      if (p.is_pinned) c.pinned++;
      if (p.is_flagged) c.flagged++;
      c[p.category] = (c[p.category] || 0) + 1;
    });
    return c;
  }, [posts]);

  const pin = async (p: Post) => { await supabase.from("posts").update({ is_pinned: !p.is_pinned }).eq("id", p.id); refresh(); };
  const feature = async (p: Post) => { await supabase.from("posts").update({ is_featured: !p.is_featured }).eq("id", p.id); refresh(); };
  const flag = async (p: Post) => { await supabase.from("posts").update({ is_flagged: !p.is_flagged, flag_reason: p.is_flagged ? null : "Admin flagged" }).eq("id", p.id); refresh(); };
  const remove = async (p: Post) => { if (!confirm(`Delete "${p.title}"?`)) return; await supabase.from("posts").delete().eq("id", p.id); refresh(); };
  const warn = async (p: Post) => {
    await supabase.from("notifications").insert({
      user_id: p.user_id, type: "system",
      title: "Community guidelines reminder",
      body: `Your post "${p.title.slice(0, 40)}" was reviewed by our team. Please follow community guidelines.`,
      post_id: p.id,
    });
    alert("Warning notification sent.");
  };

  const stats = useMemo(() => {
    const today0 = new Date(); today0.setHours(0, 0, 0, 0);
    const todayCount = posts.filter((p) => new Date(p.created_at) >= today0).length;
    const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
    const cats: Record<string, number> = {};
    posts.forEach((p) => { cats[p.category] = (cats[p.category] || 0) + 1; });
    const top = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { todayCount, totalLikes, top };
  }, [posts]);

  return (
    <>
      <PageTitle title="Community Posts" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>
        <div>
          <TabBar tabs={TABS.map((t) => ({ ...t, count: counts[t.id] ?? 0 }))} value={tab} onChange={setTab} />
          <Card padding={0}>
            {filtered.length === 0 ? <Empty>No posts in this filter.</Empty> : (
              <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
                <thead><tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  {["Author", "Wk", "Category", "Title", "♥", "Date", "Status", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: "12px 14px", color: "#ddd" }}>{p.display_name ?? "Anon"}</td>
                      <td style={{ padding: "12px 14px", color: "#888" }}>{p.week_posted ?? "—"}</td>
                      <td style={{ padding: "12px 14px", color: "#aaa", textTransform: "capitalize" }}>{p.category}</td>
                      <td style={{ padding: "12px 14px", color: "#fff", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</td>
                      <td style={{ padding: "12px 14px", color: C.orange }}>{p.likes}</td>
                      <td style={{ padding: "12px 14px", color: "#888" }}>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 14px", display: "flex", gap: 4 }}>
                        {p.is_pinned && <StatusPill tone="warning">Pinned</StatusPill>}
                        {p.is_featured && <StatusPill tone="premium">Featured</StatusPill>}
                        {p.is_flagged && <StatusPill tone="danger">Flagged</StatusPill>}
                      </td>
                      <td style={{ padding: "12px 14px", display: "flex", gap: 4 }}>
                        <Btn size="sm" variant="ghost" onClick={() => pin(p)}>{p.is_pinned ? "Unpin" : "Pin"}</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => feature(p)}>{p.is_featured ? "Unfeat" : "Feature"}</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => flag(p)}>{p.is_flagged ? "Clear" : "Flag"}</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => warn(p)}>Warn</Btn>
                        <Btn size="sm" variant="danger" onClick={() => remove(p)}>×</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
        <div>
          <Card padding={18}>
            <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Today</p>
            <p style={{ ...fontUI, fontSize: 13, color: "#ddd", margin: "4px 0" }}>{stats.todayCount} new posts</p>
            <p style={{ ...fontUI, fontSize: 13, color: "#ddd", margin: "4px 0" }}>{stats.totalLikes} total likes</p>
            <p style={{ ...fontUI, fontSize: 11, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", margin: "16px 0 8px" }}>Trending</p>
            {stats.top.map(([cat, n]) => (
              <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#ddd" }}>
                <span style={{ textTransform: "capitalize" }}>{cat}</span>
                <span style={{ color: C.orange }}>{n}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminCommunity;
