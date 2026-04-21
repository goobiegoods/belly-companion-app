import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  due_date: string | null;
  pregnancy_number: number | null;
  is_premium: boolean | null;
  created_at: string;
}

const calcWeek = (due: string | null) => {
  if (!due) return "—";
  const dueDate = new Date(due);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const daysUntil = Math.floor(diffMs / 86400000);
  const week = Math.max(0, Math.min(40, 40 - Math.floor(daysUntil / 7)));
  return week;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setUsers((data as any) ?? []);
    })();
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.first_name || "").toLowerCase().includes(q) || u.user_id.includes(q);
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Users</h1>
      <p style={{ fontSize: 13, color: "#7A7A85", marginBottom: 20 }}>{users.length} total mamas.</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or user id…"
        style={{
          width: 320, padding: "10px 14px", borderRadius: 10,
          background: "#16161A", border: "1px solid #26262C", color: "#fff",
          fontSize: 13, marginBottom: 18, outline: "none",
        }}
      />

      <div style={{ background: "#16161A", border: "1px solid #26262C", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1B1B20", color: "#7A7A85", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Name</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Week</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Due date</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Pregnancy</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Premium</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#7A7A85" }}>No users found.</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid #26262C" }}>
                <td style={{ padding: "12px 18px", color: "#fff" }}>{u.first_name || "—"}</td>
                <td style={{ padding: "12px 18px" }}>{calcWeek(u.due_date)}</td>
                <td style={{ padding: "12px 18px", color: "#7A7A85" }}>{u.due_date ? new Date(u.due_date).toLocaleDateString() : "—"}</td>
                <td style={{ padding: "12px 18px" }}>{u.pregnancy_number ?? 1}</td>
                <td style={{ padding: "12px 18px" }}>
                  {u.is_premium ? <span style={{ background: "rgba(255,140,66,0.14)", color: "#FF8C42", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>Pro</span> : <span style={{ color: "#7A7A85" }}>Free</span>}
                </td>
                <td style={{ padding: "12px 18px", color: "#7A7A85" }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
