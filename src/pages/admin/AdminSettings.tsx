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
  fontUI,
} from "@/components/admin/ui";

type AdminRow = {
  user_id: string;
  created_at: string;
  first_name?: string | null;
};

type Cfg = {
  free_message_limit: number;
  premium_monthly_price: number;
  maintenance_mode: boolean;
};

const AdminSettings = () => {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [cfg, setCfg] = useState<Cfg>({ free_message_limit: 10, premium_monthly_price: 9.99, maintenance_mode: false });
  const [hasOrders, setHasOrders] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const refresh = async () => {
    const [roles, conf, ords] = await Promise.all([
      supabase.from("user_roles").select("user_id, created_at").eq("role", "admin"),
      supabase.from("app_config").select("*").eq("id", 1).maybeSingle(),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid"),
    ]);
    const adminIds = (roles.data ?? []).map((r: any) => r.user_id);
    let names: Record<string, string> = {};
    if (adminIds.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id, first_name").in("user_id", adminIds);
      (profs ?? []).forEach((p: any) => { names[p.user_id] = p.first_name ?? ""; });
    }
    setAdmins((roles.data ?? []).map((r: any) => ({ ...r, first_name: names[r.user_id] })));
    if (conf.data) setCfg({
      free_message_limit: conf.data.free_message_limit,
      premium_monthly_price: Number(conf.data.premium_monthly_price),
      maintenance_mode: !!conf.data.maintenance_mode,
    });
    setHasOrders((ords.count ?? 0) > 0);
  };

  useEffect(() => { refresh(); }, []);

  const saveCfg = async (patch: Partial<Cfg>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    await supabase.from("app_config").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
  };

  const removeAdmin = async (uid: string) => {
    if (!confirm("Remove admin?")) return;
    await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    refresh();
  };

  const addAdminByEmail = async () => {
    alert("Adding by email needs a server-side function (auth.users is not directly readable). Use Users → Make Admin instead.");
    setNewAdminEmail("");
  };

  const wipeTestData = async () => {
    if (hasOrders) return alert("Real paid orders exist. Wipe disabled for safety.");
    if (!confirm("Wipe all journal entries, mood logs, kick counts, chat messages, and posts? This cannot be undone.")) return;
    await Promise.all([
      supabase.from("journal_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("mood_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("kick_counts").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);
    alert("Test data wiped.");
  };

  return (
    <>
      <PageTitle title="Settings" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
        <Card padding={20}>
          <SectionTitle>Admins</SectionTitle>
          {admins.length === 0 && (
            <div style={{ background: "rgba(255,140,66,0.06)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <p style={{ ...fontUI, fontSize: 12, color: "#ddd", margin: 0 }}>
                No admins. Run in Lovable Cloud SQL editor:
              </p>
              <code style={{ display: "block", fontSize: 11, color: C.orange, marginTop: 6 }}>
                INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'admin');
              </code>
            </div>
          )}
          {admins.length === 0 ? <Empty>—</Empty> : admins.map((a) => (
            <div key={a.user_id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
              <div>
                <p style={{ ...fontUI, fontSize: 13, color: "#fff", margin: 0 }}>{a.first_name || "(unnamed)"}</p>
                <p style={{ ...fontUI, fontSize: 11, color: C.muted, margin: 0, fontFamily: "monospace" }}>{a.user_id.slice(0, 16)}…</p>
              </div>
              <Btn size="sm" variant="danger" onClick={() => removeAdmin(a.user_id)}>Remove</Btn>
            </div>
          ))}
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="email@example.com" />
            <Btn variant="secondary" onClick={addAdminByEmail}>Add</Btn>
          </div>
        </Card>

        <Card padding={20}>
          <SectionTitle>App config</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Free message limit / day</p>
              <Input type="number" value={cfg.free_message_limit} onChange={(e) => saveCfg({ free_message_limit: Number(e.target.value) })} />
            </div>
            <div>
              <p style={{ ...fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>Premium monthly price ($)</p>
              <Input type="number" step="0.01" value={cfg.premium_monthly_price} onChange={(e) => saveCfg({ premium_monthly_price: Number(e.target.value) })} />
              <p style={{ ...fontUI, fontSize: 10, color: C.muted, marginTop: 4 }}>Reminder: also change the Stripe product price.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ ...fontUI, fontSize: 13, color: "#fff", margin: 0 }}>Maintenance mode</p>
                <p style={{ ...fontUI, fontSize: 11, color: C.muted, margin: "4px 0 0" }}>Shows users a maintenance screen.</p>
              </div>
              <button
                onClick={() => saveCfg({ maintenance_mode: !cfg.maintenance_mode })}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: cfg.maintenance_mode ? C.orange : "#222",
                  border: "none", position: "relative", cursor: "pointer",
                }}
              >
                <span style={{
                  position: "absolute", top: 2, left: cfg.maintenance_mode ? 22 : 2,
                  width: 20, height: 20, borderRadius: "50%", background: "#fff",
                  transition: "left 160ms",
                }} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card padding={20} style={{ borderColor: "rgba(239,68,68,0.3)" }}>
        <SectionTitle>Danger zone</SectionTitle>
        <p style={{ ...fontUI, fontSize: 13, color: C.text, marginBottom: 14 }}>
          {hasOrders ? "Real paid orders exist. Wipe disabled for safety." : "No real paid orders. You may wipe test data."}
        </p>
        <Btn variant="danger" onClick={wipeTestData} disabled={hasOrders}>Wipe test data</Btn>
      </Card>
    </>
  );
};

export default AdminSettings;
