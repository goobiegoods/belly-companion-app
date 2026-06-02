import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, C, Card, Empty, Input, Label, MetricCard, Modal, PageTitle, Select, SlidePanel, StatusPill, TabBar, Textarea, ago, fontUI } from "@/components/admin/ui";

interface Ticket {
  id: string; user_id: string | null; email: string | null; subject: string;
  body: string; status: string; priority: string; category: string;
  admin_reply: string | null; replied_at: string | null; created_at: string; updated_at: string;
}

const PRIORITY_TONE: Record<string, any> = { low:"neutral", normal:"info", high:"warning", urgent:"danger" };
const STATUS_TONE: Record<string, any> = { open:"warning", in_progress:"info", resolved:"success", closed:"neutral" };

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tab, setTab] = useState("open");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject:"", body:"", priority:"normal", category:"general", email:"" });

  const load = async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending:false });
    setTickets((data ?? []) as Ticket[]);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const ch = supabase.channel("admin-support-live")
      .on("postgres_changes", { event:"*", schema:"public", table:"support_tickets" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const open = tickets.filter(t => t.status === "open").length;
  const inProgress = tickets.filter(t => t.status === "in_progress").length;
  const resolved = tickets.filter(t => t.status === "resolved").length;
  const urgent = tickets.filter(t => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed").length;

  const filtered = useMemo(() => {
    let list = tab === "all" ? tickets : tickets.filter(t => t.status === tab);
    if (search) list = list.filter(t => t.subject.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase()) || (t.email ?? "").toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [tickets, tab, search]);

  const tabCounts: Record<string,number> = {
    open, in_progress: inProgress, resolved, all: tickets.length,
  };

  const openTicket = (t: Ticket) => {
    setSelected(t);
    setReply(t.admin_reply ?? "");
    setNewStatus(t.status);
  };

  const sendReply = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase.from("support_tickets").update({
      admin_reply: reply,
      status: newStatus,
      replied_at: new Date().toISOString(),
    }).eq("id", selected.id);
    await load();
    setSelected(t => t ? { ...t, admin_reply: reply, status: newStatus } : t);
    setSaving(false);
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.body) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("support_tickets").insert({
      user_id: user?.id ?? null,
      email: newTicket.email || user?.email || null,
      subject: newTicket.subject,
      body: newTicket.body,
      priority: newTicket.priority,
      category: newTicket.category,
    });
    setCreateOpen(false);
    setNewTicket({ subject:"", body:"", priority:"normal", category:"general", email:"" });
    await load();
  };

  return (
    <div>
      <PageTitle title="Support Tickets" right={<Btn variant="primary" size="sm" onClick={() => setCreateOpen(true)}>+ New Ticket</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        <MetricCard label="Open" value={open} />
        <MetricCard label="In Progress" value={inProgress} />
        <MetricCard label="Resolved" value={resolved} />
        <Card style={{ border: urgent > 0 ? "1px solid rgba(239,68,68,0.35)" : undefined }}>
          <Label>Urgent</Label>
          <div style={{ fontSize:32, fontFamily:"'Fraunces',serif", color: urgent > 0 ? "#ef4444" : C.white, marginTop:4, lineHeight:1 }}>{urgent}</div>
          <p style={{ ...fontUI, fontSize:11, color:"#444", margin:"4px 0 0" }}>need immediate attention</p>
        </Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 18px 0" }}>
          <div style={{ marginBottom:12 }}>
            <Input placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:360 }} />
          </div>
          <TabBar
            tabs={["open","in_progress","resolved","all"]}
            active={tab}
            onChange={setTab}
            counts={tabCounts}
          />
        </div>

        {filtered.length === 0
          ? <Empty>No tickets found</Empty>
          : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{["Priority","Subject","Category","User","Status","Created",""].map(h => (
                <th key={h} style={{ ...fontUI, fontSize:10, fontWeight:700, color:"#3a3a3a", textAlign:"left", padding:"10px 14px", letterSpacing:0.5, textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} onClick={() => openTicket(t)} style={{ borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}>
                  <td style={{ padding:"12px 14px" }}>
                    <StatusPill tone={PRIORITY_TONE[t.priority] ?? "neutral"}>{t.priority}</StatusPill>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <p style={{ ...fontUI, fontSize:13, color:"#ddd", margin:0, fontWeight:500 }}>{t.subject}</p>
                    <p style={{ ...fontUI, fontSize:11, color:"#555", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:280 }}>{t.body.slice(0,80)}…</p>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <StatusPill tone="neutral">{t.category}</StatusPill>
                  </td>
                  <td style={{ ...fontUI, fontSize:11, color:"#666", padding:"12px 14px", fontFamily:"monospace" }}>
                    {t.email ?? (t.user_id ? t.user_id.slice(0,10)+"…" : "anonymous")}
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <StatusPill tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status.replace("_"," ")}</StatusPill>
                  </td>
                  <td style={{ ...fontUI, fontSize:11, color:"#444", padding:"12px 14px" }}>{ago(t.created_at)}</td>
                  <td style={{ ...fontUI, fontSize:11, color:"#3a3a3a", padding:"12px 14px" }}>
                    {!t.admin_reply && t.status === "open" && <span style={{ color:C.orange, fontWeight:700 }}>Reply →</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Ticket detail + reply */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.subject ?? ""} width={560}>
        {selected && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              <div><Label>Status</Label><StatusPill tone={STATUS_TONE[selected.status]}>{selected.status.replace("_"," ")}</StatusPill></div>
              <div><Label>Priority</Label><StatusPill tone={PRIORITY_TONE[selected.priority]}>{selected.priority}</StatusPill></div>
              <div><Label>Category</Label><StatusPill tone="neutral">{selected.category}</StatusPill></div>
            </div>
            <div>
              <Label>From</Label>
              <p style={{ ...fontUI, fontSize:13, color:"#bbb", margin:0 }}>{selected.email ?? selected.user_id ?? "Anonymous"}</p>
            </div>
            <div>
              <Label>Message</Label>
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px" }}>
                <p style={{ ...fontUI, fontSize:14, color:"#ccc", margin:0, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{selected.body}</p>
              </div>
              <p style={{ ...fontUI, fontSize:10, color:"#333", margin:"6px 0 0" }}>{new Date(selected.created_at).toLocaleString()}</p>
            </div>
            {selected.admin_reply && (
              <div>
                <Label>Previous Reply</Label>
                <div style={{ background:"rgba(232,112,42,0.06)", border:"1px solid rgba(232,112,42,0.2)", borderRadius:10, padding:"14px 16px" }}>
                  <p style={{ ...fontUI, fontSize:13, color:"#bbb", margin:0, whiteSpace:"pre-wrap" }}>{selected.admin_reply}</p>
                </div>
                {selected.replied_at && <p style={{ ...fontUI, fontSize:10, color:"#333", margin:"4px 0 0" }}>Sent {ago(selected.replied_at)}</p>}
              </div>
            )}
            <div>
              <Label>Reply</Label>
              <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply to the user…" style={{ minHeight:120 }} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 140px", gap:10 }}>
              <div>
                <Label>Update Status</Label>
                <Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end" }}>
                <Btn variant="primary" onClick={sendReply} disabled={saving} style={{ width:"100%" }}>
                  {saving ? "Sending…" : "Send Reply"}
                </Btn>
              </div>
            </div>
          </div>
        )}
      </SlidePanel>

      {/* Create ticket modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Support Ticket">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><Label>Subject</Label><Input value={newTicket.subject} onChange={e => setNewTicket(t => ({ ...t, subject: e.target.value }))} placeholder="Brief description of issue" /></div>
          <div><Label>Message</Label><Textarea value={newTicket.body} onChange={e => setNewTicket(t => ({ ...t, body: e.target.value }))} placeholder="Full details…" style={{ minHeight:100 }} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><Label>Priority</Label>
              <Select value={newTicket.priority} onChange={e => setNewTicket(t => ({ ...t, priority: e.target.value }))}>
                <option value="low">Low</option><option value="normal">Normal</option>
                <option value="high">High</option><option value="urgent">Urgent</option>
              </Select>
            </div>
            <div><Label>Category</Label>
              <Select value={newTicket.category} onChange={e => setNewTicket(t => ({ ...t, category: e.target.value }))}>
                <option value="general">General</option><option value="order">Order</option>
                <option value="billing">Billing</option><option value="technical">Technical</option>
                <option value="account">Account</option><option value="other">Other</option>
              </Select>
            </div>
          </div>
          <div><Label>Contact Email (optional)</Label><Input value={newTicket.email} onChange={e => setNewTicket(t => ({ ...t, email: e.target.value }))} type="email" placeholder="user@example.com" /></div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={createTicket}>Create Ticket</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
