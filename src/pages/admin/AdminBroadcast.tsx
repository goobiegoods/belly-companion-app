import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Btn,
  C,
  Card,
  Empty,
  Input,
  PageTitle,
  SectionTitle,
  Select,
  Textarea,
  fontTitle,
  fontUI,
} from "@/components/admin/ui";

type Broadcast = {
  id: string;
  title: string;
  body: string;
  cta_text: string | null;
  cta_url: string | null;
  segment: string;
  scheduled_for: string | null;
  sent_at: string | null;
  reach_estimate: number;
  created_at: string;
};

const SEGMENTS: { value: string; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "premium", label: "Premium only" },
  { value: "free", label: "Free users" },
  { value: "t1", label: "Trimester 1 (week 1–13)" },
  { value: "t2", label: "Trimester 2 (week 14–26)" },
  { value: "t3", label: "Trimester 3 (week 27–40)" },
  { value: "inactive7", label: "Inactive 7+ days" },
];

const segmentQuery = (seg: string) => {
  const today = new Date().toISOString().slice(0, 10);
  const t1Cutoff = new Date(); t1Cutoff.setDate(t1Cutoff.getDate() + (40 - 13) * 7);
  const t2Cutoff = new Date(); t2Cutoff.setDate(t2Cutoff.getDate() + (40 - 26) * 7);
  const t3Cutoff = new Date();
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
  let q = supabase.from("profiles").select("user_id", { count: "exact" });
  if (seg === "premium") q = q.eq("is_premium", true);
  if (seg === "free") q = q.eq("is_premium", false);
  if (seg === "t1") q = q.gte("due_date", t1Cutoff.toISOString().slice(0, 10));
  if (seg === "t2") q = q.gte("due_date", t2Cutoff.toISOString().slice(0, 10)).lt("due_date", t1Cutoff.toISOString().slice(0, 10));
  if (seg === "t3") q = q.gte("due_date", today).lt("due_date", t2Cutoff.toISOString().slice(0, 10));
  if (seg === "inactive7") q = q.lt("updated_at", sevenAgo.toISOString());
  return q;
};

const AdminBroadcast = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [url, setUrl] = useState("");
  const [seg, setSeg] = useState("all");
  const [reach, setReach] = useState(0);
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [sending, setSending] = useState(false);

  const refreshHistory = async () => {
    const { data } = await supabase.from("broadcasts").select("*").order("created_at", { ascending: false }).limit(20);
    setHistory((data as Broadcast[]) ?? []);
  };

  useEffect(() => { refreshHistory(); }, []);

  useEffect(() => {
    (async () => {
      const { count } = await segmentQuery(seg);
      setReach(count ?? 0);
    })();
  }, [seg]);

  const send = async () => {
    if (!title || !body) return;
    setSending(true);
    const { count, data: targets } = await segmentQuery(seg);
    const reach_estimate = count ?? 0;
    const { data: bc } = await supabase.from("broadcasts").insert({
      title, body,
      cta_text: cta || null,
      cta_url: url || null,
      segment: seg,
      reach_estimate,
      sent_at: new Date().toISOString(),
    }).select().single();

    if (bc && targets) {
      const rows = (targets as { user_id: string }[]).map((t) => ({
        user_id: t.user_id,
        type: "broadcast",
        title,
        body,
        post_id: null,
      }));
      // chunk insert to avoid huge payloads
      for (let i = 0; i < rows.length; i += 200) {
        await supabase.from("notifications").insert(rows.slice(i, i + 200));
      }
    }
    setTitle(""); setBody(""); setCta(""); setUrl("");
    setSending(false);
    refreshHistory();
  };

  return (
    <>
      <PageTitle title="Broadcast" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
        <div>
          <Card padding={20}>
            <SectionTitle>Compose</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Title</p>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A note from your Belly team…" />
              </div>
              <div>
                <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Body</p>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Speak warmly. Keep it short." rows={4} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                <div>
                  <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>CTA text</p>
                  <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Open recipes" />
                </div>
                <div>
                  <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>CTA url</p>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/recipes" />
                </div>
              </div>
              <div>
                <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Segment</p>
                <Select value={seg} onChange={(e) => setSeg(e.target.value)}>
                  {SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
                <p style={{ ...fontUI, fontSize: 11, color: C.orange, marginTop: 6 }}>Estimated reach: {reach} {reach === 1 ? "user" : "users"}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Btn onClick={send} disabled={sending || !title || !body || reach === 0}>{sending ? "Sending…" : `Send to ${reach}`}</Btn>
              </div>
            </div>
          </Card>

          <Card padding={20} style={{ marginTop: 18 }}>
            <SectionTitle>History</SectionTitle>
            {history.length === 0 ? <Empty>No broadcasts yet.</Empty> : (
              <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
                <thead>
                  <tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700 }}>Title</th>
                    <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700 }}>Segment</th>
                    <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700 }}>Reach</th>
                    <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700 }}>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 0", color: "#fff" }}>{b.title}</td>
                      <td style={{ padding: "10px 0", color: "#aaa" }}>{b.segment}</td>
                      <td style={{ padding: "10px 0", color: C.orange }}>{b.reach_estimate}</td>
                      <td style={{ padding: "10px 0", color: "#888" }}>{b.sent_at ? new Date(b.sent_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div>
          <Card padding={20}>
            <SectionTitle>Push preview</SectionTitle>
            <div style={{ background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, background: C.orange, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#1a0a00", ...fontTitle, fontSize: 14 }}>B</div>
                <span style={{ ...fontUI, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Belly · now</span>
              </div>
              <p style={{ ...fontUI, fontSize: 13, fontWeight: 600, color: "#fff", margin: "10px 0 4px" }}>{title || "Title preview"}</p>
              <p style={{ ...fontUI, fontSize: 12, color: "#bbb", margin: 0 }}>{body || "Body of your broadcast appears here."}</p>
              {cta && <p style={{ ...fontUI, fontSize: 11, color: C.orange, marginTop: 8 }}>→ {cta}</p>}
            </div>
            <p style={{ ...fontUI, fontSize: 10, color: C.muted, marginTop: 14 }}>
              Delivered as in-app notifications. Real push (OneSignal/Expo) can be added later.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminBroadcast;
