import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, C, Card, Empty, Input, Label, MetricCard, Modal, PageTitle, Select, SlidePanel, StatusPill, TabBar, Textarea, ago, fmtUSD, fontTitle, fontUI } from "@/components/admin/ui";

interface Order {
  id: string; user_id: string; total: number; status: string; created_at: string;
  items: any[]; shipping_address: string | null; stripe_session_id: string | null;
  tracking_number: string | null; carrier: string | null; shipped_at: string | null;
  paid_at: string | null; admin_notes: string | null; promo_code: string | null; amount_paid: number | null;
}

function playOrderChime() {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    [659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.connect(gain); osc.frequency.value = freq; osc.type = "sine";
      osc.start(ctx.currentTime + i * 0.12); osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch {}
}

const TABS = ["All","Pending","Paid","Shipped","Delivered","Cancelled"];
const STATUS_MAP: Record<string,string> = { pending:"Pending", pending_payment:"Pending", paid:"Paid", shipped:"Shipped", delivered:"Delivered", cancelled:"Cancelled", abandoned:"Cancelled" };

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [notes, setNotes] = useState("");
  const [shipModal, setShipModal] = useState(false);
  const [carrier, setCarrier] = useState("USPS");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [newFlash, setNewFlash] = useState<string | null>(null);
  const prevCountRef = useRef(0);

  // Revenue calcs
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paidOrders = useMemo(() => orders.filter(o => o.status === "paid" || o.status === "shipped" || o.status === "delivered"), [orders]);
  const revenueToday = useMemo(() => paidOrders.filter(o => o.paid_at && new Date(o.paid_at) >= todayStart).reduce((s,o) => s+Number(o.total),0), [paidOrders]);
  const revenueWeek = useMemo(() => paidOrders.filter(o => o.paid_at && new Date(o.paid_at) >= weekStart).reduce((s,o) => s+Number(o.total),0), [paidOrders]);
  const revenueMonth = useMemo(() => paidOrders.filter(o => o.paid_at && new Date(o.paid_at) >= monthStart).reduce((s,o) => s+Number(o.total),0), [paidOrders]);
  const revenueAllTime = useMemo(() => paidOrders.reduce((s,o) => s+Number(o.total),0), [paidOrders]);

  // Best sellers from JSONB items
  const bestSellers = useMemo(() => {
    const counts: Record<string, { name:string; qty:number; revenue:number }> = {};
    paidOrders.forEach(o => {
      (Array.isArray(o.items) ? o.items : []).forEach((item:any) => {
        const k = item.id ?? item.name ?? "unknown";
        if (!counts[k]) counts[k] = { name: item.name ?? k, qty:0, revenue:0 };
        counts[k].qty += item.qty ?? 1;
        counts[k].revenue += (item.price ?? 0) * (item.qty ?? 1);
      });
    });
    return Object.values(counts).sort((a,b) => b.qty - a.qty).slice(0,5);
  }, [paidOrders]);

  // Pipeline counts
  const pipeline = useMemo(() => ({
    pending: orders.filter(o => ["pending","pending_payment"].includes(o.status)).length,
    paid: orders.filter(o => o.status === "paid").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  }), [orders]);

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending:false });
    const list = (data ?? []) as Order[];
    if (prevCountRef.current > 0 && list.length > prevCountRef.current) {
      setNewFlash(list[0].id);
      playOrderChime();
      setTimeout(() => setNewFlash(null), 4000);
    }
    prevCountRef.current = list.length;
    setOrders(list);
  };

  useEffect(() => { loadOrders(); }, []);

  // Real-time new orders
  useEffect(() => {
    const ch = supabase.channel("admin-orders-live")
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"orders" }, loadOrders)
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"orders" }, loadOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab !== "All") list = list.filter(o => STATUS_MAP[o.status]?.toLowerCase() === tab.toLowerCase());
    if (search) list = list.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || (o.user_id ?? "").toLowerCase().includes(search.toLowerCase()) || (o.promo_code ?? "").toLowerCase().includes(search.toLowerCase()));
    if (dateRange !== "all") {
      const cutoff = dateRange === "7" ? weekStart : dateRange === "30" ? monthStart : new Date(now.getTime() - 90*24*60*60*1000);
      list = list.filter(o => new Date(o.created_at) >= cutoff);
    }
    return list;
  }, [orders, tab, search, dateRange]);

  const tabCounts = useMemo(() => {
    const map: Record<string,number> = { All: orders.length };
    TABS.slice(1).forEach(t => { map[t] = orders.filter(o => STATUS_MAP[o.status]?.toLowerCase() === t.toLowerCase()).length; });
    return map;
  }, [orders]);

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", selected.id);
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, admin_notes: notes } : o));
    setSaving(false);
  };

  const markShipped = async () => {
    if (!selected) return;
    await supabase.from("orders").update({ status:"shipped", carrier, tracking_number: tracking, shipped_at: new Date().toISOString() }).eq("id", selected.id);
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status:"shipped", carrier, tracking_number: tracking } : o));
    setSelected(s => s ? { ...s, status:"shipped", carrier, tracking_number: tracking } : s);
    setShipModal(false);
  };

  return (
    <div>
      <PageTitle title="Orders & Revenue" />

      {/* Revenue metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        <MetricCard label="Revenue Today" value={fmtUSD(revenueToday)} />
        <MetricCard label="Revenue This Week" value={fmtUSD(revenueWeek)} />
        <MetricCard label="Revenue This Month" value={fmtUSD(revenueMonth)} />
        <MetricCard label="All-Time Revenue" value={fmtUSD(revenueAllTime)} />
      </div>

      {/* Pipeline */}
      <Card style={{ marginBottom:18 }}>
        <p style={{ ...fontUI, fontSize:10, fontWeight:700, letterSpacing:1.2, color:"#444", textTransform:"uppercase", margin:"0 0 14px" }}>Order Pipeline</p>
        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
          {[
            { label:"Pending", count: pipeline.pending, color:"#FF8C42" },
            { label:"Paid", count: pipeline.paid, color:"#22c55e" },
            { label:"Shipped", count: pipeline.shipped, color:"#3b82f6" },
            { label:"Delivered", count: pipeline.delivered, color:"#a855f7" },
          ].map((stage, i) => (
            <div key={stage.label} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ textAlign:"center", padding:"0 20px" }}>
                <div style={{ ...fontTitle as any, fontSize:28, color: stage.count > 0 ? stage.color : "#333", lineHeight:1 }}>{stage.count}</div>
                <div style={{ ...fontUI, fontSize:11, color:"#555", marginTop:4 }}>{stage.label}</div>
              </div>
              {i < 3 && <div style={{ color:"#2a2a2a", fontSize:18, margin:"0 4px" }}>→</div>}
            </div>
          ))}
        </div>
      </Card>

      {/* Best sellers + orders table */}
      <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:12 }}>
        <Card>
          <p style={{ ...fontUI, fontSize:10, fontWeight:700, letterSpacing:1.2, color:"#444", textTransform:"uppercase", margin:"0 0 14px" }}>Best Sellers</p>
          {bestSellers.length === 0 && <p style={{ ...fontUI, fontSize:12, color:"#333" }}>No sales yet</p>}
          {bestSellers.map((p, i) => (
            <div key={p.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom: i < bestSellers.length-1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ ...fontUI, fontSize:12, color:"#444", fontWeight:700, width:16, flexShrink:0 }}>#{i+1}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ ...fontUI, fontSize:12, color:"#bbb", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                <p style={{ ...fontUI, fontSize:10, color:"#444", margin:0 }}>{p.qty} sold · {fmtUSD(p.revenue)}</p>
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"16px 18px 0" }}>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <Input placeholder="Search order ID, user, promo…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1 }} />
              <Select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ width:130 }}>
                <option value="all">All time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </Select>
            </div>
            <TabBar tabs={TABS} active={tab} onChange={setTab} counts={tabCounts} />
          </div>

          {filtered.length === 0
            ? <Empty>No orders found</Empty>
            : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>{["ID","Date","Items","Promo","Total","Status",""].map(h => (
                  <th key={h} style={{ ...fontUI, fontSize:10, fontWeight:700, color:"#3a3a3a", textAlign:"left", padding:"10px 12px", letterSpacing:0.5, textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}
                    onClick={() => { setSelected(o); setNotes(o.admin_notes ?? ""); }}
                    style={{ borderBottom:`1px solid ${C.border}`, cursor:"pointer", background: o.id === newFlash ? "rgba(232,112,42,0.1)" : "transparent", transition:"background 0.5s" }}
                  >
                    <td style={{ ...fontUI, fontSize:11, color:"#555", padding:"11px 12px", fontFamily:"monospace" }}>{o.id.slice(0,8)}…</td>
                    <td style={{ ...fontUI, fontSize:11, color:"#666", padding:"11px 12px" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ ...fontUI, fontSize:12, color:"#888", padding:"11px 12px" }}>{Array.isArray(o.items)?o.items.length:0}</td>
                    <td style={{ ...fontUI, fontSize:11, color:"#555", padding:"11px 12px", fontFamily:"monospace" }}>{o.promo_code ?? "—"}</td>
                    <td style={{ ...fontUI, fontSize:13, color:C.orange, fontWeight:700, padding:"11px 12px" }}>{fmtUSD(Number(o.total))}</td>
                    <td style={{ padding:"11px 12px" }}>
                      <StatusPill tone={o.status==="paid"?"success":o.status==="shipped"?"info":o.status==="delivered"?"success":o.status==="cancelled"||o.status==="abandoned"?"danger":"warning"}>
                        {STATUS_MAP[o.status] ?? o.status}
                      </StatusPill>
                    </td>
                    <td style={{ padding:"11px 12px" }}>
                      {o.id === newFlash && <span style={{ ...fontUI, fontSize:10, color:C.orange, fontWeight:700, letterSpacing:0.5 }}>NEW</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Order detail panel */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.id.slice(0,8)}…`} width={540}>
        {selected && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><Label>Status</Label><StatusPill tone={selected.status==="paid"?"success":selected.status==="shipped"?"info":"warning"}>{STATUS_MAP[selected.status]??selected.status}</StatusPill></div>
              <div><Label>Date</Label><p style={{ ...fontUI, fontSize:13, color:"#bbb", margin:0 }}>{new Date(selected.created_at).toLocaleString()}</p></div>
              <div><Label>Total</Label><p style={{ ...fontUI, fontSize:18, color:C.orange, fontWeight:700, margin:0 }}>{fmtUSD(Number(selected.total))}</p></div>
              <div><Label>Customer</Label><p style={{ ...fontUI, fontSize:11, color:"#555", margin:0, fontFamily:"monospace" }}>{selected.user_id.slice(0,16)}…</p></div>
            </div>
            <div>
              <Label>Items</Label>
              {(Array.isArray(selected.items)?selected.items:[]).map((item:any, i:number) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ ...fontUI, fontSize:13, color:"#bbb" }}>{item.emoji ?? ""} {item.name}</span>
                  <span style={{ ...fontUI, fontSize:13, color:"#888" }}>{item.qty ?? 1} × {fmtUSD(item.price ?? 0)}</span>
                </div>
              ))}
            </div>
            {selected.shipping_address && <div><Label>Shipping Address</Label><pre style={{ ...fontUI, fontSize:12, color:"#888", margin:0, whiteSpace:"pre-wrap" }}>{selected.shipping_address}</pre></div>}
            {selected.tracking_number && <div><Label>Tracking</Label><p style={{ ...fontUI, fontSize:12, color:"#bbb", margin:0, fontFamily:"monospace" }}>{selected.carrier} · {selected.tracking_number}</p></div>}
            <div><Label>Admin Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes (not visible to customer)…" style={{ minHeight:80 }} /></div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="primary" size="sm" onClick={saveNotes} disabled={saving}>{saving ? "Saving…" : "Save Notes"}</Btn>
              {(selected.status === "paid") && <Btn variant="secondary" size="sm" onClick={() => setShipModal(true)}>Mark Shipped</Btn>}
            </div>
          </div>
        )}
      </SlidePanel>

      <Modal open={shipModal} onClose={() => setShipModal(false)} title="Mark as Shipped">
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><Label>Carrier</Label>
            <Select value={carrier} onChange={e => setCarrier(e.target.value)}>
              {["USPS","UPS","FedEx","DHL"].map(c => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div><Label>Tracking Number</Label><Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="1Z…" /></div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn variant="secondary" size="sm" onClick={() => setShipModal(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={markShipped}>Confirm Shipment</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
