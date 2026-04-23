import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Btn,
  C,
  Card,
  Empty,
  Input,
  PageTitle,
  SlidePanel,
  StatusPill,
  fontUI,
  ago,
} from "@/components/admin/ui";

type Msg = {
  id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
  is_flagged: boolean;
  reviewed_at: string | null;
};

type Conv = {
  user_id: string;
  day: string;
  count: number;
  last: string;
  topic: string;
  flagged: boolean;
};

const FLAG_KEYWORDS = ["bleeding", "pain", "emergency", "urgent", "hospital", "contact your provider"];

const AdminChats = () => {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<{ user_id: string; day: string } | null>(null);

  const refresh = async () => {
    const { data } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(1000);
    setMsgs((data as Msg[]) ?? []);
  };

  useEffect(() => { refresh(); }, []);

  const conversations = useMemo<Conv[]>(() => {
    const byKey: Record<string, Msg[]> = {};
    msgs.forEach((m) => {
      const day = m.created_at.slice(0, 10);
      const k = `${m.user_id}|${day}`;
      (byKey[k] ||= []).push(m);
    });
    return Object.entries(byKey).map(([k, arr]) => {
      const [user_id, day] = k.split("|");
      const sorted = arr.sort((a, b) => a.created_at.localeCompare(b.created_at));
      const last = sorted[sorted.length - 1];
      const lastUser = [...sorted].reverse().find((m) => m.role === "user");
      const flagged = sorted.some((m) => m.is_flagged) || sorted.some((m) => FLAG_KEYWORDS.some((kw) => m.content.toLowerCase().includes(kw)));
      return {
        user_id,
        day,
        count: sorted.length,
        last: last.created_at,
        topic: (lastUser?.content ?? last.content).slice(0, 60),
        flagged,
      };
    }).sort((a, b) => b.last.localeCompare(a.last));
  }, [msgs]);

  const filtered = q
    ? conversations.filter((c) => msgs.some((m) => m.user_id === c.user_id && m.created_at.slice(0, 10) === c.day && m.content.toLowerCase().includes(q.toLowerCase())))
    : conversations;

  const thread = open ? msgs.filter((m) => m.user_id === open.user_id && m.created_at.slice(0, 10) === open.day).sort((a, b) => a.created_at.localeCompare(b.created_at)) : [];

  const flagMsg = async (id: string, value: boolean) => {
    await supabase.from("chat_messages").update({
      is_flagged: value,
      reviewed_at: value ? null : new Date().toISOString(),
    }).eq("id", id);
    refresh();
  };

  return (
    <>
      <PageTitle title="Doula Chat Logs" />

      <div style={{ marginBottom: 16 }}>
        <Input placeholder="Search conversations by keyword (e.g. bleeding)…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 380 }} />
      </div>

      <Card padding={0}>
        {filtered.length === 0 ? <Empty>No conversations.</Empty> : (
          <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
            <thead>
              <tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                {["User", "Date", "Messages", "Last topic", "Flag"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((c) => (
                <tr key={`${c.user_id}-${c.day}`} onClick={() => setOpen({ user_id: c.user_id, day: c.day })} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer" }}>
                  <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>{c.user_id.slice(0, 8)}…</td>
                  <td style={{ padding: "12px 18px", color: "#888" }}>{c.day}</td>
                  <td style={{ padding: "12px 18px", color: "#aaa" }}>{c.count}</td>
                  <td style={{ padding: "12px 18px", color: "#ddd", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.topic}</td>
                  <td style={{ padding: "12px 18px" }}>{c.flagged && <StatusPill tone="danger">Flagged</StatusPill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <SlidePanel open={!!open} onClose={() => setOpen(null)} title={open ? `Conversation · ${open.day}` : ""} width={620}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {thread.map((m) => (
            <div key={m.id} style={{ background: m.role === "user" ? "#0c0c0c" : "rgba(255,140,66,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...fontUI, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: m.role === "user" ? "#aaa" : C.orange, textTransform: "uppercase" }}>
                  {m.role === "user" ? "User" : "Doula"}
                </span>
                <span style={{ ...fontUI, fontSize: 10, color: C.muted }}>{ago(m.created_at)}</span>
              </div>
              <p style={{ ...fontUI, fontSize: 13, color: "#eee", margin: 0, whiteSpace: "pre-wrap" }}>{m.content}</p>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                {m.is_flagged ? (
                  <Btn size="sm" variant="secondary" onClick={() => flagMsg(m.id, false)}>Mark reviewed</Btn>
                ) : (
                  <Btn size="sm" variant="danger" onClick={() => flagMsg(m.id, true)}>Flag for review</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      </SlidePanel>
    </>
  );
};

export default AdminChats;
