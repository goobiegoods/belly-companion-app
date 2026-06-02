import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { C, Card, Empty, Input, Label, MetricCard, PageTitle, SlidePanel, StatusPill, TabBar, ago, fontUI, fontTitle } from "@/components/admin/ui";

interface ChatMessage { id: string; user_id: string; role: string; content: string; created_at: string; is_flagged: boolean; conversation_id: string | null; }

interface Conversation {
  key: string; user_id: string; date: string; messages: ChatMessage[];
  lastMessage: string; msgCount: number; hasFlagged: boolean;
}

const STOP = new Set(["what","that","this","with","from","have","just","your","they","will","been","were","their","there","when","also","about","which","would","could","should","like","know","more","some","into","very","than","then","make","time","over","only","most","where","after","need","feel","help","baby","week","weeks","pregnancy","pregnant","trimester","taking","trying","want","does","good","okay","much","dont","cant","still","even","any","all","for","its","are","not","but","the","and","you","that","this","can","she","him","her","our","was","how","get","now","just"]);

function topTopics(messages: ChatMessage[], n = 10): { word: string; count: number }[] {
  const freq: Record<string, number> = {};
  messages.filter(m => m.role === "user").forEach(m => {
    String(m.content).toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/).forEach(w => {
      if (w.length >= 4 && !STOP.has(w)) freq[w] = (freq[w] ?? 0) + 1;
    });
  });
  return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,n).map(([word,count]) => ({ word, count }));
}

export default function AdminAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(2000);
      setMessages((data ?? []) as ChatMessage[]);
      setLoading(false);
    })();
  }, []);

  // Group into conversations (user_id + date)
  const conversations = useMemo<Conversation[]>(() => {
    const map: Record<string, Conversation> = {};
    messages.forEach(m => {
      const date = m.created_at.slice(0,10);
      const key = `${m.user_id}|${date}`;
      if (!map[key]) map[key] = { key, user_id: m.user_id, date, messages: [], lastMessage: "", msgCount: 0, hasFlagged: false };
      map[key].messages.push(m);
      map[key].msgCount++;
      if (m.is_flagged) map[key].hasFlagged = true;
    });
    return Object.values(map).map(c => ({
      ...c,
      messages: c.messages.sort((a,b) => a.created_at.localeCompare(b.created_at)),
      lastMessage: c.messages.filter(m => m.role === "user").slice(-1)[0]?.content?.slice(0,70) ?? "",
    })).sort((a,b) => b.date.localeCompare(a.date) || b.messages.slice(-1)[0]?.created_at.localeCompare(a.messages.slice(-1)[0]?.created_at));
  }, [messages]);

  const today = new Date().toISOString().slice(0,10);
  const convsToday = conversations.filter(c => c.date === today).length;
  const msgsToday = messages.filter(m => m.created_at.slice(0,10) === today && m.role === "user").length;
  const flaggedCount = messages.filter(m => m.is_flagged).length;
  const uniqueUsers = new Set(messages.map(m => m.user_id)).size;
  const topics = useMemo(() => topTopics(messages, 12), [messages]);

  const filtered = useMemo(() => {
    let list = conversations;
    if (tab === "Flagged") list = list.filter(c => c.hasFlagged);
    if (tab === "Today") list = list.filter(c => c.date === today);
    if (search) list = list.filter(c => c.user_id.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [conversations, tab, search]);

  const flagMsg = async (id: string, flag: boolean) => {
    await supabase.from("chat_messages").update({ is_flagged: flag, reviewed_at: flag ? null : new Date().toISOString() }).eq("id", id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_flagged: flag } : m));
    if (selected) setSelected(s => s ? { ...s, messages: s.messages.map(m => m.id === id ? { ...m, is_flagged: flag } : m), hasFlagged: s.messages.some(m => m.id !== id && m.is_flagged) || flag } : s);
  };

  return (
    <div>
      <PageTitle title="Bella AI Insights" />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        <MetricCard label="Conversations Today" value={loading ? "…" : convsToday} />
        <MetricCard label="Messages Today" value={loading ? "…" : msgsToday} />
        <MetricCard label="Flagged Messages" value={loading ? "…" : flaggedCount} />
        <MetricCard label="Unique Users" value={loading ? "…" : uniqueUsers} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:14 }}>
        {/* Topic analysis */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <p style={{ ...fontUI, fontSize:10, fontWeight:700, letterSpacing:1.2, color:"#444", textTransform:"uppercase", margin:"0 0 14px" }}>Top Topics Asked</p>
            {topics.length === 0 && <p style={{ ...fontUI, fontSize:12, color:"#333" }}>No data yet</p>}
            {topics.map((t, i) => (
              <div key={t.word} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                <span style={{ ...fontUI, fontSize:11, color:"#444", width:16, flexShrink:0 }}>#{i+1}</span>
                <span style={{ ...fontUI, fontSize:13, color:"#bbb", flex:1, textTransform:"capitalize" }}>{t.word}</span>
                <span style={{ ...fontUI, fontSize:11, color:C.orange, fontWeight:700 }}>{t.count}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Conversations table */}
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"16px 18px 0" }}>
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <Input placeholder="Search by user or content…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1 }} />
            </div>
            <TabBar tabs={["All","Today","Flagged"]} active={tab} onChange={setTab} counts={{ All: conversations.length, Today: conversations.filter(c => c.date === today).length, Flagged: conversations.filter(c => c.hasFlagged).length }} />
          </div>
          {loading ? <div style={{ ...fontUI, fontSize:12, color:"#333", padding:20 }}>Loading…</div>
            : filtered.length === 0 ? <Empty>No conversations found</Empty>
            : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>{["User","Date","Messages","Last Message","Flags",""].map(h => (
                  <th key={h} style={{ ...fontUI, fontSize:10, fontWeight:700, color:"#3a3a3a", textAlign:"left", padding:"10px 14px", letterSpacing:0.5, textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.key} onClick={() => setSelected(c)} style={{ borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}>
                    <td style={{ ...fontUI, fontSize:11, color:"#666", padding:"11px 14px", fontFamily:"monospace" }}>{c.user_id.slice(0,12)}…</td>
                    <td style={{ ...fontUI, fontSize:11, color:"#666", padding:"11px 14px" }}>{c.date}</td>
                    <td style={{ ...fontUI, fontSize:12, color:"#888", padding:"11px 14px" }}>{c.msgCount}</td>
                    <td style={{ ...fontUI, fontSize:12, color:"#777", padding:"11px 14px", maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{c.lastMessage}…"</td>
                    <td style={{ padding:"11px 14px" }}>{c.hasFlagged && <StatusPill tone="danger">Flagged</StatusPill>}</td>
                    <td style={{ ...fontUI, fontSize:11, color:"#3a3a3a", padding:"11px 14px" }}>View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Conversation viewer */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={`Conversation · ${selected?.user_id.slice(0,16)}…`} width={580}>
        {selected && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <Label>{selected.date}</Label>
              <Label>{selected.msgCount} messages</Label>
              {selected.hasFlagged && <StatusPill tone="danger">Has flagged messages</StatusPill>}
            </div>
            {selected.messages.map(m => (
              <div key={m.id} style={{
                padding:"12px 14px", borderRadius:10,
                background: m.role === "user" ? "#1a1a1a" : "rgba(232,112,42,0.07)",
                border: m.is_flagged ? "1px solid rgba(239,68,68,0.4)" : `1px solid ${C.border}`,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ ...fontUI, fontSize:10, fontWeight:700, letterSpacing:1, color: m.role === "user" ? "#888" : C.orange, textTransform:"uppercase" }}>{m.role === "user" ? "User" : "Bella"}</span>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ ...fontUI, fontSize:10, color:"#3a3a3a" }}>{ago(m.created_at)}</span>
                    <button onClick={() => flagMsg(m.id, !m.is_flagged)} style={{ ...fontUI, fontSize:10, background:"transparent", border:`1px solid ${C.border}`, color: m.is_flagged ? "#ef4444" : "#444", borderRadius:4, padding:"2px 7px", cursor:"pointer" }}>
                      {m.is_flagged ? "Unflag" : "Flag"}
                    </button>
                  </div>
                </div>
                <p style={{ ...fontUI, fontSize:13, color:"#bbb", margin:0, whiteSpace:"pre-wrap", lineHeight:1.5 }}>{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
