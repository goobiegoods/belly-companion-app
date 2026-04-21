import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  likes: number;
  is_pinned: boolean;
  created_at: string;
  display_name: string | null;
}

const AdminCommunity = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const load = async () => {
    const { data } = await supabase.from("posts").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    setPosts((data as any) ?? []);
  };

  useEffect(() => { load(); }, []);

  const togglePin = async (p: Post) => {
    const { error } = await supabase.from("posts").update({ is_pinned: !p.is_pinned }).eq("id", p.id);
    if (error) toast.error("Failed to update post");
    else { toast.success(p.is_pinned ? "Unpinned" : "Pinned"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Community</h1>
      <p style={{ fontSize: 13, color: "#7A7A85", marginBottom: 20 }}>Moderate posts and pin announcements.</p>

      <div style={{ background: "#16161A", border: "1px solid #26262C", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1B1B20", color: "#7A7A85", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Title</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Author</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Category</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Likes</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Posted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#7A7A85" }}>No posts yet.</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #26262C" }}>
                <td style={{ padding: "12px 18px", color: "#fff" }}>
                  {p.is_pinned && <span style={{ marginRight: 6, fontSize: 10, color: "#FF8C42" }}>📌</span>}
                  {p.title}
                </td>
                <td style={{ padding: "12px 18px", color: "#7A7A85" }}>{p.display_name || "Anonymous"}</td>
                <td style={{ padding: "12px 18px", textTransform: "capitalize" }}>{p.category}</td>
                <td style={{ padding: "12px 18px" }}>{p.likes}</td>
                <td style={{ padding: "12px 18px", color: "#7A7A85" }}>{new Date(p.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                  <button onClick={() => togglePin(p)} style={{ background: "transparent", border: "1px solid #26262C", color: "#C8C8D0", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", marginRight: 6 }}>
                    {p.is_pinned ? "Unpin" : "Pin"}
                  </button>
                  <button onClick={() => remove(p.id)} style={{ background: "transparent", border: "1px solid #4A1F1F", color: "#E06060", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCommunity;
