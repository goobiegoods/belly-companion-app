import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, C, Card, Empty, Input, Label, PageTitle, SlidePanel, StatusPill, TabBar, Textarea, fmtUSD, fontUI } from "@/components/admin/ui";

interface Product {
  id: string; name: string; description: string; price: number; emoji: string;
  category: string; stripe_price_id: string; is_active: boolean; sort_order: number;
  tag: string | null; brand: string | null; unit: string | null; use_case: string | null;
  contents: string[]; created_at: string; updated_at: string;
}

type Draft = Omit<Product, "created_at" | "updated_at">;

const CATS = ["All","kit","remedy","tea"];
const CAT_LABELS: Record<string,string> = { kit:"Kit", remedy:"Remedy", tea:"Tea" };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Partial<Draft>>({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setProducts((data ?? []) as Product[]);
  };

  useEffect(() => { load(); }, []);

  // Real-time updates so changes reflect instantly everywhere
  useEffect(() => {
    const ch = supabase.channel("admin-products-live")
      .on("postgres_changes", { event:"*", schema:"public", table:"products" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (tab !== "All") list = list.filter(p => p.category === tab);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, tab, search]);

  const tabCounts = useMemo(() => {
    const m: Record<string,number> = { All: products.length };
    ["kit","remedy","tea"].forEach(c => { m[c] = products.filter(p => p.category === c).length; });
    return m;
  }, [products]);

  const openEdit = (p: Product) => {
    setSelected(p);
    setDraft({ ...p });
  };

  const save = async () => {
    if (!selected || !draft) return;
    setSaving(true);
    const { error } = await supabase.from("products").update({
      name: draft.name, description: draft.description, price: Number(draft.price),
      emoji: draft.emoji, stripe_price_id: draft.stripe_price_id, tag: draft.tag ?? null,
      brand: draft.brand ?? null, unit: draft.unit ?? null, use_case: draft.use_case ?? null,
    }).eq("id", selected.id);
    if (!error) {
      setSavedFlash(selected.id);
      setTimeout(() => setSavedFlash(null), 2500);
      await load();
    }
    setSaving(false);
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    await load();
  };

  return (
    <div>
      <PageTitle title="Content Manager"
        right={<span style={{ ...fontUI, fontSize:11, color:"#444" }}>Changes go live in the app instantly</span>}
      />

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 18px 0" }}>
          <div style={{ marginBottom:12 }}>
            <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:320 }} />
          </div>
          <TabBar tabs={CATS} active={tab} onChange={setTab} counts={tabCounts} />
        </div>

        {filtered.length === 0
          ? <Empty>No products found</Empty>
          : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{["","Name","Category","Price","Stripe ID","Status","Actions"].map(h => (
                <th key={h} style={{ ...fontUI, fontSize:10, fontWeight:700, color:"#3a3a3a", textAlign:"left", padding:"10px 14px", letterSpacing:0.5, textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`, background: savedFlash === p.id ? "rgba(34,197,94,0.06)" : "transparent", transition:"background 0.6s" }}>
                  <td style={{ padding:"12px 14px", fontSize:20, width:44 }}>{p.emoji}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <p style={{ ...fontUI, fontSize:13, color:"#ddd", margin:0, fontWeight:600 }}>{p.name}</p>
                    {p.tag && <span style={{ ...fontUI, fontSize:10, color:C.orange, display:"block", marginTop:2 }}>{p.tag}</span>}
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <StatusPill tone="neutral">{CAT_LABELS[p.category] ?? p.category}</StatusPill>
                  </td>
                  <td style={{ ...fontUI, fontSize:14, color:C.orange, fontWeight:700, padding:"12px 14px" }}>{fmtUSD(p.price)}</td>
                  <td style={{ ...fontUI, fontSize:11, color:"#555", padding:"12px 14px", fontFamily:"monospace" }}>{p.stripe_price_id || <span style={{ color:"#2a2a2a" }}>—</span>}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <StatusPill tone={p.is_active ? "success" : "danger"}>{p.is_active ? "Active" : "Hidden"}</StatusPill>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <Btn variant="secondary" size="sm" onClick={() => openEdit(p)}>Edit</Btn>
                      <Btn variant={p.is_active ? "ghost" : "secondary"} size="sm" onClick={() => toggleActive(p)}>{p.is_active ? "Hide" : "Show"}</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={`Edit: ${selected?.name}`} width={520}>
        {selected && draft && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <Label>Emoji</Label>
              <Input value={draft.emoji ?? ""} onChange={e => setDraft(d => ({ ...d, emoji: e.target.value }))} style={{ width:80, fontSize:20, textAlign:"center" }} />
            </div>
            <div>
              <Label>Product Name</Label>
              <Input value={draft.name ?? ""} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={draft.description ?? ""} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} style={{ minHeight:100 }} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" min="0" value={draft.price ?? ""} onChange={e => setDraft(d => ({ ...d, price: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <Label>Tag (optional label)</Label>
                <Input value={draft.tag ?? ""} onChange={e => setDraft(d => ({ ...d, tag: e.target.value || null }))} placeholder="e.g. First trimester" />
              </div>
            </div>
            <div>
              <Label>Stripe Price ID</Label>
              <Input value={draft.stripe_price_id ?? ""} onChange={e => setDraft(d => ({ ...d, stripe_price_id: e.target.value }))} placeholder="price_xxx" style={{ fontFamily:"monospace" }} />
            </div>
            {selected.category === "remedy" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><Label>Brand</Label><Input value={draft.brand ?? ""} onChange={e => setDraft(d => ({ ...d, brand: e.target.value }))} /></div>
                <div><Label>Unit</Label><Input value={draft.unit ?? ""} onChange={e => setDraft(d => ({ ...d, unit: e.target.value }))} placeholder="80 pellets" /></div>
              </div>
            )}
            <div>
              <Label>Use Case</Label>
              <Input value={draft.use_case ?? ""} onChange={e => setDraft(d => ({ ...d, use_case: e.target.value }))} placeholder="What this product is for" />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="primary" onClick={save} disabled={saving} style={{ flex:1 }}>
                {saving ? "Saving…" : "💾 Save & Go Live"}
              </Btn>
              <Btn variant="secondary" onClick={() => setSelected(null)}>Cancel</Btn>
            </div>
            {savedFlash === selected.id && (
              <p style={{ ...fontUI, fontSize:12, color:"#22c55e", textAlign:"center", margin:0 }}>✓ Changes are now live in the app</p>
            )}
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
