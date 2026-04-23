import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Btn, C, Card, Empty, Input, Modal, PageTitle, Select, SectionTitle,
  SlidePanel, StatusPill, TabBar, Textarea, fmtUSD, fontUI,
} from "@/components/admin/ui";

type Order = {
  id: string; user_id: string; total: number; status: string;
  created_at: string; paid_at: string | null; shipped_at: string | null;
  items: any; shipping_address: string | null; stripe_session_id: string | null;
  promo_code: string | null; tracking_number: string | null;
  carrier: string | null; admin_notes: string | null;
};

const STATUS_TONE: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  paid: "success", pending: "warning", shipped: "info", cancelled: "danger",
};
const TABS = [
  { id: "all", label: "All" }, { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" }, { id: "shipped", label: "Shipped" }, { id: "cancelled", label: "Cancelled" },
];
const RANGE_DAYS: Record<string, number> = { "7": 7, "30": 30, "90": 90, all: 9999 };

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [range, setRange] = useState("30");
  const [open, setOpen] = useState<Order | null>(null);
  const [shipModal, setShipModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [notes, setNotes] = useState("");

  const refresh = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const cutoff = Date.now() - RANGE_DAYS[range] * 86400000;
    return orders.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (new Date(o.created_at).getTime() < cutoff) return false;
      if (q) {
        const hay = `${o.id} ${o.user_id} ${o.shipping_address ?? ""} ${JSON.stringify(o.items)}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [orders, tab, q, range]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length, pending: 0, paid: 0, shipped: 0, cancelled: 0 };
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  const exportCsv = () => {
    const headers = ["id", "created_at", "user_id", "items", "total", "promo_code", "status", "tracking_number"];
    const rows = filtered.map((o) =>
      headers.map((h) => {
        const v = (o as any)[h];
        if (h === "items") return JSON.stringify(v).replace(/"/g, '""');
        return String(v ?? "").replace(/"/g, '""');
      }).map((s) => `"${s}"`).join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const submitShip = async () => {
    if (!open) return;
    await supabase.from("orders").update({
      status: "shipped", tracking_number: tracking || null,
      carrier: carrier || null, shipped_at: new Date().toISOString(),
    }).eq("id", open.id);
    setShipModal(false); setTracking(""); refresh(); setOpen(null);
  };
  const saveNotes = async () => {
    if (!open) return;
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", open.id);
    refresh();
  };
  const openOrder = (o: Order) => { setOpen(o); setNotes(o.admin_notes ?? ""); };

  return (
    <>
      <PageTitle title="Orders" right={<Btn variant="secondary" onClick={exportCsv}>Export CSV</Btn>} />
      <TabBar tabs={TABS.map((t) => ({ ...t, count: counts[t.id] }))} value={tab} onChange={setTab} />
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Input placeholder="Search by ID, customer, product…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 360 }} />
        <Select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="7">Last 7 days</option><option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option><option value="all">All time</option>
        </Select>
      </div>
      <Card padding={0}>
        {filtered.length === 0 ? <Empty>No orders match.</Empty> : (
          <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
            <thead><tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {["Order", "Date", "Customer", "Items", "Promo", "Total", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontWeight: 700 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((o) => {
                const items = Array.isArray(o.items) ? o.items : [];
                return (
                  <tr key={o.id} onClick={() => openOrder(o)} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer" }}>
                    <td style={{ padding: "12px 18px", color: "#ddd", fontFamily: "monospace", fontSize: 11 }}>#{o.id.slice(0, 8)}</td>
                    <td style={{ padding: "12px 18px", color: "#888" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>{o.user_id.slice(0, 8)}…</td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>{items.length}</td>
                    <td style={{ padding: "12px 18px", color: o.promo_code ? C.orange : "#555" }}>{o.promo_code || "—"}</td>
                    <td style={{ padding: "12px 18px", color: "#fff", fontWeight: 600 }}>{fmtUSD(Number(o.total))}</td>
                    <td style={{ padding: "12px 18px" }}><StatusPill tone={STATUS_TONE[o.status] ?? "neutral"}>{o.status}</StatusPill></td>
                    <td style={{ padding: "12px 18px", color: C.muted }}>›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <SlidePanel open={!!open} onClose={() => setOpen(null)} title={open ? `#${open.id.slice(0, 8).toUpperCase()}` : ""}>
        {open && (
          <div style={{ ...fontUI, color: "#ddd", fontSize: 13, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <StatusPill tone={STATUS_TONE[open.status] ?? "neutral"}>{open.status}</StatusPill>
              <p style={{ margin: "8px 0 0", color: C.muted, fontSize: 12 }}>{new Date(open.created_at).toLocaleString()}</p>
            </div>
            <div><SectionTitle>Customer</SectionTitle>
              <p style={{ margin: 0, fontSize: 12, color: C.muted }}>User ID</p>
              <p style={{ margin: "2px 0", fontFamily: "monospace", fontSize: 12 }}>{open.user_id}</p>
            </div>
            <div><SectionTitle>Items</SectionTitle>
              {(Array.isArray(open.items) ? open.items : []).map((it: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
                  <span>{it.emoji ?? "🛍️"} {it.name} × {it.qty ?? 1}</span>
                  <span>{fmtUSD(Number(it.price ?? 0) * Number(it.qty ?? 1))}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 6, borderTop: `1px solid ${C.border}`, fontWeight: 700 }}>
                <span>Total</span><span style={{ color: C.orange }}>{fmtUSD(Number(open.total))}</span>
              </div>
              {open.promo_code && <p style={{ margin: "8px 0 0", color: C.orange, fontSize: 12 }}>Promo: {open.promo_code}</p>}
            </div>
            {open.shipping_address && (
              <div><SectionTitle>Shipping</SectionTitle>
                <p style={{ margin: 0, fontSize: 12, color: "#bbb", whiteSpace: "pre-wrap" }}>{open.shipping_address}</p>
              </div>
            )}
            {open.stripe_session_id && (
              <div><SectionTitle>Stripe</SectionTitle>
                <p style={{ margin: 0, fontSize: 11, fontFamily: "monospace", color: "#aaa" }}>{open.stripe_session_id}</p>
              </div>
            )}
            <div><SectionTitle>Timeline</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
                <span>✓ Placed · {new Date(open.created_at).toLocaleString()}</span>
                <span style={{ color: open.paid_at ? "#fff" : C.muted }}>{open.paid_at ? "✓" : "○"} Paid {open.paid_at && `· ${new Date(open.paid_at).toLocaleString()}`}</span>
                <span style={{ color: open.shipped_at ? "#fff" : C.muted }}>{open.shipped_at ? "✓" : "○"} Shipped {open.shipped_at && `· ${new Date(open.shipped_at).toLocaleString()}`}</span>
              </div>
              {open.tracking_number && (
                <p style={{ margin: "8px 0 0", fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{open.carrier}</span> · <span style={{ fontFamily: "monospace" }}>{open.tracking_number}</span>
                </p>
              )}
            </div>
            <div><SectionTitle>Internal notes</SectionTitle>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes only visible to admins…" />
              <Btn size="sm" variant="secondary" onClick={saveNotes} style={{ marginTop: 8 }}>Save notes</Btn>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {open.status === "paid" && <Btn onClick={() => setShipModal(true)}>Mark as Shipped</Btn>}
              <Btn variant="danger" onClick={() => setRefundModal(true)}>Refund</Btn>
            </div>
          </div>
        )}
      </SlidePanel>

      <Modal open={shipModal} onClose={() => setShipModal(false)} title="Ship order">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Carrier</p>
            <Select value={carrier} onChange={(e) => setCarrier(e.target.value)}>
              <option>USPS</option><option>UPS</option><option>FedEx</option><option>DHL</option>
            </Select>
          </div>
          <div><p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Tracking number</p>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="1Z999AA10123456784" />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn variant="secondary" onClick={() => setShipModal(false)}>Cancel</Btn>
            <Btn onClick={submitShip}>Mark Shipped</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={refundModal} onClose={() => setRefundModal(false)} title="Refund via Stripe">
        <p style={{ ...fontUI, color: C.text, fontSize: 13, marginBottom: 16 }}>
          Stripe refund integration is not wired up yet. Process this refund in the Stripe dashboard.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setRefundModal(false)}>Got it</Btn>
        </div>
      </Modal>
    </>
  );
};

export default AdminOrders;
