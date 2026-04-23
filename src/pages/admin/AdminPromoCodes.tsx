import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Btn,
  C,
  Card,
  Empty,
  Input,
  Modal,
  PageTitle,
  Select,
  StatusPill,
  fontUI,
} from "@/components/admin/ui";

type Promo = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  min_order_value: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
};

const blank = {
  code: "",
  description: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 10,
  min_order_value: 0,
  max_uses: "" as string | number,
  valid_until: "",
};

const AdminPromoCodes = () => {
  const [list, setList] = useState<Promo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [form, setForm] = useState(blank);

  const refresh = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setList((data as Promo[]) ?? []);
  };

  useEffect(() => { refresh(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  };

  const openEdit = (p: Promo) => {
    setEditing(p);
    setForm({
      code: p.code,
      description: p.description ?? "",
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      min_order_value: p.min_order_value,
      max_uses: p.max_uses ?? "",
      valid_until: p.valid_until ? p.valid_until.slice(0, 10) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: Number(form.min_order_value || 0),
      max_uses: form.max_uses === "" ? null : Number(form.max_uses),
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
    };
    if (editing) await supabase.from("promo_codes").update(payload).eq("id", editing.id);
    else await supabase.from("promo_codes").insert(payload);
    setOpen(false);
    refresh();
  };

  const toggle = async (p: Promo) => {
    await supabase.from("promo_codes").update({ is_active: !p.is_active }).eq("id", p.id);
    refresh();
  };

  const remove = async (p: Promo) => {
    if (!confirm(`Delete code ${p.code}? This cannot be undone.`)) return;
    await supabase.from("promo_codes").delete().eq("id", p.id);
    refresh();
  };

  const random = () => {
    const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    setForm((f) => ({ ...f, code: rnd }));
  };

  const statusOf = (p: Promo): { tone: "success" | "danger" | "warning"; label: string } => {
    if (!p.is_active) return { tone: "danger", label: "Inactive" };
    if (p.valid_until && new Date(p.valid_until) < new Date()) return { tone: "danger", label: "Expired" };
    if (p.max_uses && p.current_uses >= p.max_uses) return { tone: "warning", label: "Used up" };
    return { tone: "success", label: "Active" };
  };

  return (
    <>
      <PageTitle title="Promo Codes" right={<Btn onClick={openCreate}>+ Create code</Btn>} />

      <Card padding={0}>
        {list.length === 0 ? <Empty>No promo codes yet. Create one to get started.</Empty> : (
          <table style={{ width: "100%", borderCollapse: "collapse", ...fontUI, fontSize: 12 }}>
            <thead>
              <tr style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                {["Code", "Type", "Value", "Uses", "Min Order", "Valid Until", "Status", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const s = statusOf(p);
                const pct = p.max_uses ? Math.min(100, (p.current_uses / p.max_uses) * 100) : 0;
                return (
                  <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{ fontFamily: "monospace", color: "#fff", fontWeight: 600 }}>{p.code}</span>
                      {p.description && <p style={{ margin: "2px 0 0", color: C.muted, fontSize: 11 }}>{p.description}</p>}
                    </td>
                    <td style={{ padding: "12px 18px", color: "#aaa", textTransform: "capitalize" }}>{p.discount_type}</td>
                    <td style={{ padding: "12px 18px", color: C.orange, fontWeight: 600 }}>
                      {p.discount_type === "percentage" ? `${p.discount_value}%` : `$${p.discount_value}`}
                    </td>
                    <td style={{ padding: "12px 18px", minWidth: 120 }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{p.current_uses}{p.max_uses ? ` / ${p.max_uses}` : " / ∞"}</p>
                      {p.max_uses && (
                        <div style={{ marginTop: 4, height: 3, background: "#1a1a1a", borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: C.orange, borderRadius: 2 }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>${p.min_order_value || 0}</td>
                    <td style={{ padding: "12px 18px", color: "#aaa" }}>{p.valid_until ? new Date(p.valid_until).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 18px" }}><StatusPill tone={s.tone}>{s.label}</StatusPill></td>
                    <td style={{ padding: "12px 18px", display: "flex", gap: 6 }}>
                      <Btn size="sm" variant="secondary" onClick={() => openEdit(p)}>Edit</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => toggle(p)}>{p.is_active ? "Disable" : "Enable"}</Btn>
                      <Btn size="sm" variant="danger" onClick={() => remove(p)}>×</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${editing.code}` : "Create promo code"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Code</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BELLY25" />
              <Btn variant="secondary" size="sm" onClick={random}>Random</Btn>
            </div>
          </div>
          <div>
            <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Description</p>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Beta user discount" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Type</p>
              <Select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}>
                <option value="percentage">% off</option>
                <option value="fixed">$ off</option>
              </Select>
            </div>
            <div>
              <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Value</p>
              <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Min order ($)</p>
              <Input type="number" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })} />
            </div>
            <div>
              <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Max uses (blank = ∞)</p>
              <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
            </div>
          </div>
          <div>
            <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Valid until</p>
            <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={!form.code || !form.discount_value}>{editing ? "Save" : "Create"}</Btn>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminPromoCodes;
