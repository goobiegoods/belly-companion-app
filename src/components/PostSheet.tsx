import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { useVvLock } from "@/lib/viewport";
import { toast } from "sonner";

interface PostSheetCtx {
  open: () => void;
}
const Ctx = createContext<PostSheetCtx>({ open: () => {} });

export const usePostSheet = () => useContext(Ctx);

const CATEGORIES = [
  { key: "question", label: "Questions" },
  { key: "story",    label: "Stories" },
  { key: "tip",      label: "Tips" },
  { key: "support",  label: "Support" },
];

export const PostSheetProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("question");
  const [posting, setPosting] = useState(false);

  const { user, profile } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;
  useVvLock(mounted);

  const open = useCallback(() => {
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => setMounted(false), 280);
  }, []);

  const submit = async () => {
    if (!user || !title.trim() || !body.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title: title.trim(),
      body: body.trim(),
      category,
      week_posted: currentWeek,
    });
    setPosting(false);
    if (error) {
      toast.error("Couldn't post. Try again.");
      return;
    }
    toast.success("Your post is live! 🌸");
    setTitle(""); setBody(""); setCategory("question");
    close();
    // notify any listeners (Community page) to refetch
    window.dispatchEvent(new Event("belly:post-created"));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    if (visible) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {mounted && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: visible ? "rgba(40,20,5,0.45)" : "rgba(40,20,5,0)",
            transition: "background 240ms ease",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 430,
              background: "#F0E8DC",
              borderTopLeftRadius: 26, borderTopRightRadius: 26,
              height: "min(85vh, calc(var(--vvh, 100dvh) - 40px))",
              transform: visible ? "translateY(0)" : "translateY(100%)",
              transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: "flex", flexDirection: "column", position: "relative",
              boxShadow: "0 -10px 40px rgba(40,20,5,0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.15)" }} />
            </div>
            <button onClick={close} aria-label="Close" style={{
              position: "absolute", top: 14, right: 14,
              width: 32, height: 32, borderRadius: "50%",
              background: "#FFFFFF", border: "1px solid rgba(232,112,42,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <span style={{ color: "#7A5038", fontSize: 18, lineHeight: 1 }}>×</span>
            </button>

            <div style={{ padding: "10px 18px 4px" }}>
              <h2 className="font-display" style={{ fontSize: 24, fontStyle: "italic", color: "#E8702A", lineHeight: 1.1 }}>
                Share with the mamas
              </h2>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, color: "#7A5038", marginTop: 4 }}>
                Your story might be the one another mama needs today.
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px 24px" }}>
              <p className="belly-eyebrow" style={{ marginBottom: 8 }}>POST TYPE</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                {CATEGORIES.map(c => {
                  const active = category === c.key;
                  return (
                    <button key={c.key} onClick={() => setCategory(c.key)}
                      className={active ? "belly-pill-orange" : "belly-pill-neutral"}
                      style={{
                        fontSize: 11, padding: "6px 13px",
                        fontWeight: active ? 700 : 500,
                        outline: active ? "1.5px solid #E8702A" : "none",
                        cursor: "pointer",
                      }}>
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <p className="belly-eyebrow" style={{ marginBottom: 8 }}>TITLE</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                style={{
                  width: "100%", background: "#FFFFFF",
                  border: "1.5px solid rgba(232,112,42,0.18)",
                  borderRadius: 16, padding: "12px 14px",
                  fontFamily: "'Nunito',system-ui", fontSize: 14, color: "#1A0E06",
                  marginBottom: 16, outline: "none",
                }}
              />

              <p className="belly-eyebrow" style={{ marginBottom: 8 }}>YOUR MESSAGE</p>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's on your mind, mama?"
                rows={7}
                style={{
                  width: "100%", background: "#FFFFFF",
                  border: "1.5px solid rgba(232,112,42,0.18)",
                  borderRadius: 16, padding: "12px 14px",
                  fontFamily: "'Nunito',system-ui", fontSize: 13, color: "#1A0E06",
                  lineHeight: 1.55, resize: "none", outline: "none",
                  marginBottom: 20,
                }}
              />

              <button
                onClick={submit}
                disabled={!title.trim() || !body.trim() || posting || !user}
                className="belly-btn-primary-v4"
                style={{
                  width: "100%", fontSize: 14, padding: "14px",
                  opacity: (!title.trim() || !body.trim() || posting || !user) ? 0.5 : 1,
                  cursor: (!title.trim() || !body.trim() || posting || !user) ? "not-allowed" : "pointer",
                }}
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
};
