import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, C, Card, Empty, Input, Label, PageTitle, Select, SlidePanel, StatusPill, TabBar, Textarea, fmtUSD, fontUI } from "@/components/admin/ui";

interface Product {
  id: string; name: string; description: string; price: number; emoji: string;
  category: string; stripe_price_id: string; is_active: boolean; sort_order: number;
  tag: string | null; brand: string | null; unit: string | null; use_case: string | null;
  contents: string[]; created_at: string; updated_at: string;
  // Present only after the image/stock migration has been applied
  image_url?: string | null; in_stock?: boolean;
}

type Draft = Partial<Omit<Product, "created_at" | "updated_at">>;

const CATS = ["All","kit","remedy","tea"];
const CAT_LABELS: Record<string,string> = { kit:"Kit", remedy:"Remedy", tea:"Tea" };

const ToggleRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
    <Label>{label}</Label>
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{ width:42, height:22, borderRadius:11, border:`1px solid ${value ? C.orange : C.border}`, background: value ? "rgba(255,140,66,0.25)" : "#0c0c0c", position:"relative", cursor:"pointer", padding:0, flexShrink:0 }}
    >
      <span style={{ position:"absolute", top:2, left: value ? 22 : 2, width:16, height:16, borderRadius:"50%", background: value ? C.orange : "#555", transition:"left 150ms" }} />
    </button>
  </div>
);

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"edit" | "create" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // Whether the image_url/in_stock columns exist in the DB (migration applied).
  // Detected from the shape of returned rows — sending these columns before the
  // migration runs would 400, so all controls/writes are gated on this flag.
  const [extrasSupported, setExtrasSupported] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    const rows = (data ?? []) as Product[];
    setProducts(rows);
    if (rows.length > 0) {
      const first = rows[0] as unknown as Record<string, unknown>;
      setExtrasSupported("image_url" in first && "in_stock" in first);
    }
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
    setFormError(null);
    setMode("edit");
  };

  const openCreate = () => {
    setSelected(null);
    setDraft({ id:"", name:"", description:"", price: undefined, category:"kit", emoji:"", stripe_price_id:"", tag:null, brand:null, unit:null, use_case:null, is_active:true, image_url:null, in_stock:true });
    setFormError(null);
    setMode("create");
  };

  const closePanel = () => { setMode(null); setSelected(null); setFormError(null); };

  const friendlyError = (message: string, code?: string) => {
    if (code === "23505" || /duplicate key/i.test(message)) return "A product with this ID already exists.";
    if (code === "42501" || /row-level security/i.test(message)) return "Not allowed — your account lacks the admin role in the database.";
    return message;
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.from("products").update({
      name: draft.name, description: draft.description, price: Number(draft.price),
      emoji: draft.emoji, stripe_price_id: draft.stripe_price_id, tag: draft.tag ?? null,
      brand: draft.brand ?? null, unit: draft.unit ?? null, use_case: draft.use_case ?? null,
      ...(extrasSupported ? { image_url: draft.image_url?.trim() || null, in_stock: draft.in_stock ?? true } : {}),
    }).eq("id", selected.id);
    if (error) {
      setFormError(friendlyError(error.message, error.code));
    } else {
      setSavedFlash(selected.id);
      setTimeout(() => setSavedFlash(null), 2500);
      await load();
    }
    setSaving(false);
  };

  const saveCreate = async () => {
    const id = (draft.id ?? "").trim();
    const name = (draft.name ?? "").trim();
    if (!id) { setFormError("Product ID is required."); return; }
    if (/\s/.test(id)) { setFormError("Product ID cannot contain spaces — use a slug like first-trimester-kit."); return; }
    if (!name) { setFormError("Product name is required."); return; }
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price < 0) { setFormError("Enter a valid price."); return; }
    setSaving(true);
    setFormError(null);
    const nextSort = products.reduce((m, p) => Math.max(m, p.sort_order), 0) + 10;
    const { error } = await supabase.from("products").insert({
      id, name, price,
      description: draft.description ?? "",
      category: draft.category ?? "kit",
      stripe_price_id: draft.stripe_price_id ?? "",
      tag: draft.tag || null,
      brand: draft.brand || null,
      unit: draft.unit || null,
      use_case: draft.use_case || null,
      is_active: draft.is_active ?? true,
      sort_order: nextSort,
      ...(draft.emoji?.trim() ? { emoji: draft.emoji.trim() } : {}),
      ...(extrasSupported ? { image_url: draft.image_url?.trim() || null, in_stock: draft.in_stock ?? true } : {}),
    });
    if (error) {
      setFormError(friendlyError(error.message, error.code));
    } else {
      setSavedFlash(id);
      setTimeout(() => setSavedFlash(null), 2500);
      await load();
      closePanel();
    }
    setSaving(false);
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    await load();
  };

  const toggleStock = async (p: Product) => {
    if (!extrasSupported) return;
    await supabase.from("products").update({ in_stock: !(p.in_stock ?? true) }).eq("id", p.id);
    await load();
  };

  const cols = extrasSupported
    ? ["","Name","Category","Price","Stripe ID","Status","Stock","Actions"]
    : ["","Name","Category","Price","Stripe ID","Status","Actions"];

  const showBrandUnit = mode === "create" || selected?.category === "remedy";

  return (
    <div>
      <PageTitle title="Content Manager"
        right={
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ ...fontUI, fontSize:11, color:"#444" }}>Changes go live in the app instantly</span>
            <Btn variant="primary" onClick={openCreate}>+ Add product</Btn>
          </div>
        }
      />

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 18px 0" }}>
          <div style={{ marginBottom:12 }}>
            <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:320 }} />
          </div>
          <TabBar tabs={CATS.map(c => ({ id: c, label: c === "All" ? "All" : (CAT_LABELS[c] ?? c) + "s", count: tabCounts[c] ?? 0 }))} value={tab} onChange={setTab} />
        </div>

        {filtered.length === 0
          ? <Empty>No products found</Empty>
          : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{cols.map(h => (
                <th key={h} style={{ ...fontUI, fontSize:10, fontWeight:700, color:"#3a3a3a", textAlign:"left", padding:"10px 14px", letterSpacing:0.5, textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`, background: savedFlash === p.id ? "rgba(34,197,94,0.06)" : "transparent", transition:"background 0.6s" }}>
                  <td style={{ padding:"12px 14px", fontSize:20, width:44 }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width:30, height:30, borderRadius:6, objectFit:"cover", display:"block", border:`1px solid ${C.border}` }} />
                      : p.emoji}
                  </td>
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
                  {extrasSupported && (
                    <td style={{ padding:"12px 14px" }}>
                      <button
                        type="button"
                        onClick={() => toggleStock(p)}
                        title={(p.in_stock ?? true) ? "Mark out of stock" : "Mark in stock"}
                        style={{ background:"transparent", border:"none", padding:0, cursor:"pointer" }}
                      >
                        <StatusPill tone={(p.in_stock ?? true) ? "success" : "warning"}>{(p.in_stock ?? true) ? "In stock" : "Out"}</StatusPill>
                      </button>
                    </td>
                  )}
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

      <SlidePanel open={mode !== null} onClose={closePanel} title={mode === "create" ? "Add Product" : `Edit: ${selected?.name ?? ""}`} width={520}>
        {mode !== null && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {mode === "create" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <Label>Product ID (slug)</Label>
                  <Input value={draft.id ?? ""} onChange={e => setDraft(d => ({ ...d, id: e.target.value }))} placeholder="e.g. tea-5" style={{ fontFamily:"monospace" }} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={draft.category ?? "kit"} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} style={{ width:"100%" }}>
                    <option value="kit">Kit</option>
                    <option value="remedy">Remedy</option>
                    <option value="tea">Tea</option>
                  </Select>
                </div>
              </div>
            )}
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
            {extrasSupported ? (
              <>
                <div>
                  <Label>Image URL</Label>
                  <Input value={draft.image_url ?? ""} onChange={e => setDraft(d => ({ ...d, image_url: e.target.value || null }))} placeholder="https://…/product.jpg" />
                  {draft.image_url?.trim() && (
                    <img src={draft.image_url.trim()} alt="Preview" style={{ width:56, height:56, borderRadius:8, objectFit:"cover", marginTop:8, border:`1px solid ${C.border}`, display:"block" }} />
                  )}
                </div>
                <ToggleRow label="In stock" value={draft.in_stock ?? true} onChange={v => setDraft(d => ({ ...d, in_stock: v }))} />
              </>
            ) : (
              <p style={{ ...fontUI, fontSize:11, color:C.orange, margin:0 }}>Run latest migration to enable images &amp; stock</p>
            )}
            {mode === "create" && (
              <ToggleRow label="Visible in shop" value={draft.is_active ?? true} onChange={v => setDraft(d => ({ ...d, is_active: v }))} />
            )}
            <div>
              <Label>Stripe Price ID</Label>
              <Input value={draft.stripe_price_id ?? ""} onChange={e => setDraft(d => ({ ...d, stripe_price_id: e.target.value }))} placeholder="price_xxx" style={{ fontFamily:"monospace" }} />
            </div>
            {showBrandUnit && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><Label>Brand</Label><Input value={draft.brand ?? ""} onChange={e => setDraft(d => ({ ...d, brand: e.target.value }))} /></div>
                <div><Label>Unit</Label><Input value={draft.unit ?? ""} onChange={e => setDraft(d => ({ ...d, unit: e.target.value }))} placeholder="80 pellets" /></div>
              </div>
            )}
            <div>
              <Label>Use Case</Label>
              <Input value={draft.use_case ?? ""} onChange={e => setDraft(d => ({ ...d, use_case: e.target.value }))} placeholder="What this product is for" />
            </div>
            {formError && (
              <p style={{ ...fontUI, fontSize:12, color:C.danger, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"9px 12px", margin:0 }}>{formError}</p>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="primary" onClick={mode === "create" ? saveCreate : saveEdit} disabled={saving} style={{ flex:1 }}>
                {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save & Go Live"}
              </Btn>
              <Btn variant="secondary" onClick={closePanel}>Cancel</Btn>
            </div>
            {mode === "edit" && selected && savedFlash === selected.id && (
              <p style={{ ...fontUI, fontSize:12, color:"#22c55e", textAlign:"center", margin:0 }}>Changes are now live in the app</p>
            )}
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
