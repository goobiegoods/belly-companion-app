import { useMemo, useState } from "react";
import { kits, remedies, teas, type Product } from "@/data/shopData";
import {
  Btn, C, Card, Input, Modal, PageTitle, StatusPill, TabBar, Textarea, fmtUSD, fontUI,
} from "@/components/admin/ui";

type Override = { price?: number; description?: string; active?: boolean; stripe_price_id?: string };
const KEY = "belly-admin-product-overrides-v1";
const loadOv = (): Record<string, Override> => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const saveOv = (o: Record<string, Override>) => localStorage.setItem(KEY, JSON.stringify(o));

const TYPE_LABEL: Record<Product["type"], string> = { kit: "Kits", remedy: "Remedies", tea: "Teas" };

const AdminProducts = () => {
  const [tab, setTab] = useState<"all" | Product["type"]>("all");
  const [overrides, setOverrides] = useState<Record<string, Override>>(loadOv);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Override>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const all = useMemo<Product[]>(() => [...kits, ...remedies, ...teas], []);
  const view = tab === "all" ? all : all.filter((p) => p.type === tab);
  const merged = (p: Product) => ({ ...p, ...overrides[p.id] });

  const openEdit = (p: Product) => { setEditing(p); setDraft(overrides[p.id] ?? {}); };
  const save = () => {
    if (!editing) return;
    const next = { ...overrides, [editing.id]: { ...overrides[editing.id], ...draft } };
    setOverrides(next); saveOv(next); setEditing(null);
  };
  const toggleActive = (id: string) => {
    const cur = overrides[id]?.active;
    const next = { ...overrides, [id]: { ...overrides[id], active: cur === false ? true : false } };
    setOverrides(next); saveOv(next);
  };

  return (
    <>
      <PageTitle title="Products" />
      <p style={{ ...fontUI, fontSize: 12, color: C.muted, marginBottom: 16 }}>
        Catalog from <code style={{ color: "#888" }}>shopData.ts</code>. Edits are saved locally —
        connect to a <code style={{ color: "#888" }}>products</code> table for live editing.
      </p>
      <TabBar
        tabs={[
          { id: "all", label: "All", count: all.length },
          { id: "kit", label: "Kits", count: kits.length },
          { id: "remedy", label: "Remedies", count: remedies.length },
          { id: "tea", label: "Teas", count: teas.length },
        ]}
        value={tab} onChange={(v) => setTab(v as any)}
      />
      <Card padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
          <thead><tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {["", "Name", "Category", "Price", "Stripe", "Status", ""].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontWeight: 700 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {view.map((p) => {
              const m = merged(p);
              const isOpen = expanded === p.id;
              const active = m.active !== false;
              return (
                <>
                  <tr key={p.id} onClick={() => setExpanded(isOpen ? null : p.id)} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer", opacity: active ? 1 : 0.5 }}>
                    <td style={{ padding: "12px 18px", fontSize: 18 }}>{p.emoji}</td>
                    <td style={{ padding: "12px 18px", color: "#fff", fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>{TYPE_LABEL[p.type]}</td>
                    <td style={{ padding: "12px 18px", color: C.orange, fontWeight: 600 }}>{fmtUSD(m.price)}</td>
                    <td style={{ padding: "12px 18px", color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{m.stripe_price_id || "—"}</td>
                    <td style={{ padding: "12px 18px" }}><StatusPill tone={active ? "success" : "neutral"}>{active ? "Active" : "Hidden"}</StatusPill></td>
                    <td style={{ padding: "12px 18px", display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <Btn size="sm" variant="secondary" onClick={() => openEdit(p)}>Edit</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => toggleActive(p.id)}>{active ? "Hide" : "Show"}</Btn>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr style={{ borderTop: `1px solid ${C.border}`, background: "#0c0c0c" }}>
                      <td colSpan={7} style={{ padding: "14px 18px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: 11, color: C.muted }}>USE</p>
                        <p style={{ margin: 0, fontSize: 13 }}>{p.description ?? p.use}</p>
                        {p.contents && (<>
                          <p style={{ margin: "10px 0 4px", fontSize: 11, color: C.muted }}>CONTENTS</p>
                          <p style={{ margin: 0, fontSize: 13 }}>{p.contents.join(" · ")}</p>
                        </>)}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit · ${editing.name}` : ""}>
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Price ($)</p>
              <Input type="number" step="0.01" value={draft.price ?? editing.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            </div>
            <div><p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Description</p>
              <Textarea value={draft.description ?? editing.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div><p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Stripe price ID</p>
              <Input value={draft.stripe_price_id ?? ""} onChange={(e) => setDraft({ ...draft, stripe_price_id: e.target.value })} placeholder="price_xxx" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={save}>Save</Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminProducts;
