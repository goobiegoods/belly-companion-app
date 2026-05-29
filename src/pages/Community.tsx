import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { Heart, MessageCircle, Plus, Send, Bell } from "lucide-react";
import { toast } from "sonner";
import NotificationBell, { useNotifications } from "@/components/NotificationBell";
import { getDisplayName } from "@/lib/community";
import { SEEDED_POSTS, type Post } from "@/data/seededPosts";

interface Notification {
  id: string; title: string; body: string | null; post_id: string | null;
  is_read: boolean; created_at: string;
}

const CATEGORIES = ["All", "Questions", "Stories", "Tips", "Support"];

const CATEGORY_PILL_COLORS: Record<string, string> = {
  question: "rgba(255,255,255,0.20)",
  tip: "rgba(200,255,220,0.20)",
  story: "rgba(220,200,255,0.20)",
  support: "rgba(255,255,200,0.20)",
};

const titleCase = (s: string) => {
  const safe = getDisplayName({ first_name: s });
  return safe.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const Community = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("question");
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [replyError, setReplyError] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState<string | null>(null);

  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;

  const handleNotifTap = async (notif: { id: string; post_id: string | null; is_read: boolean; title: string; body: string | null; created_at: string }) => {
    await markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.post_id) {
      const { data } = await supabase.from("posts").select("*").eq("id", notif.post_id).single();
      if (data) {
        const { data: prof } = await supabase.from("profiles").select("first_name").eq("user_id", data.user_id).single();
        openPost({ ...data, author_name: prof?.first_name || "Mama", comment_count: 0, is_liked: false });
      }
    }
  };

  const fetchPosts = async () => {
    let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (activeCategory !== "All") query = query.eq("category", activeCategory.toLowerCase().slice(0, -1));
    const { data } = await query;
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, first_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profiles?.forEach(p => { nameMap[p.user_id] = p.first_name || "Mama"; });
      const postIds = data.map(p => p.id);
      const { data: commentData } = await supabase.from("comments").select("post_id").in("post_id", postIds);
      const countMap: Record<string, number> = {};
      commentData?.forEach(c => { countMap[c.post_id] = (countMap[c.post_id] || 0) + 1; });
      let likeMap: Record<string, boolean> = {};
      if (user) {
        const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds);
        likes?.forEach(l => { likeMap[l.post_id] = true; });
      }
      const dbPosts = data.map(p => ({ ...p, author_name: nameMap[p.user_id] || "Mama", comment_count: countMap[p.id] || 0, is_liked: !!likeMap[p.id] }));
      const realTitles = new Set(dbPosts.map(p => p.title));
      const filtered = SEEDED_POSTS.filter(s => !realTitles.has(s.title));
      if (activeCategory !== "All") {
        const catKey = activeCategory.toLowerCase().slice(0, -1);
        setPosts([...dbPosts, ...filtered.filter(s => s.category === catKey)].filter(p => p.title && p.title.trim().length >= 4));
      } else {
        setPosts([...dbPosts, ...filtered].filter(p => p.title && p.title.trim().length >= 4));
      }
    } else {
      if (activeCategory !== "All") {
        const catKey = activeCategory.toLowerCase().slice(0, -1);
        setPosts(SEEDED_POSTS.filter(s => s.category === catKey));
      } else {
        setPosts(SEEDED_POSTS);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [activeCategory]);

  const createPost = async () => {
    if (!newTitle.trim() || !newBody.trim() || !user) return;
    setPosting(true); setPostError("");
    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, title: newTitle.trim(), body: newBody.trim(), category: newCategory, week_posted: currentWeek })
      .select()
      .single();
    if (error || !inserted) { setPostError("Something went wrong. Please try again."); setPosting(false); return; }
    // Optimistic prepend
    const newPost: Post = {
      ...(inserted as any),
      author_name: profile?.first_name || "Mama",
      comment_count: 0,
      is_liked: false,
    };
    setPosts(prev => [newPost, ...prev]);
    setShowCreate(false); setNewTitle(""); setNewBody(""); setNewCategory("question"); setPosting(false);
    toast.success("Your post is live! 🌸");
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    setLikeAnimating(post.id);
    setTimeout(() => setLikeAnimating(null), 400);

    // Optimistic update for instant feedback (works for both seeded + real posts)
    const nextLiked = !post.is_liked;
    const nextLikes = Math.max(0, post.likes + (nextLiked ? 1 : -1));
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_liked: nextLiked, likes: nextLikes } : p));
    setSelectedPost(prev => prev && prev.id === post.id ? { ...prev, is_liked: nextLiked, likes: nextLikes } : prev);

    // Seeded posts are local-only — don't hit the database
    if (post.id.startsWith("seed-")) return;

    if (post.is_liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      await supabase.from("posts").update({ likes: nextLikes }).eq("id", post.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
      await supabase.from("posts").update({ likes: nextLikes }).eq("id", post.id);
    }
  };

  const openPost = async (post: Post) => {
    setSelectedPost(post); setReplyError("");
    if (post.id.startsWith("seed-")) { setComments([]); return; }
    const { data } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, first_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profiles?.forEach(p => { nameMap[p.user_id] = p.first_name || "Mama"; });
      setComments(data.map(c => ({ ...c, author_name: nameMap[c.user_id] || "Mama" })));
    } else { setComments([]); }
  };

  const addComment = async () => {
    if (!commentText.trim() || !user || !selectedPost || selectedPost.id.startsWith("seed-")) return;
    setSendingReply(true); setReplyError("");
    const body = commentText.trim();
    const optimisticComment = { id: "temp-" + Date.now(), post_id: selectedPost.id, user_id: user.id, body, created_at: new Date().toISOString(), author_name: profile?.first_name || "Mama" };
    setComments(prev => [...prev, optimisticComment]);
    setCommentText("");
    const { error } = await supabase.from("comments").insert({ post_id: selectedPost.id, user_id: user.id, body });
    setSendingReply(false);
    if (error) { setComments(prev => prev.filter(c => c.id !== optimisticComment.id)); setReplyError("Couldn't send. Try again."); setCommentText(body); return; }
    openPost(selectedPost);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const initials = (name: string) => name?.charAt(0).toUpperCase() || "M";
  const userName = profile?.first_name || "Mama";

  // Find pinned post (highest likes)
  const pinnedPost = posts.length > 0 ? [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] : null;
  const remainingPosts = pinnedPost ? posts.filter(p => p.id !== pinnedPost.id) : posts;

  // --- NOTIFICATIONS ---
  if (showNotifications) {
    return (
      <div className="h-screen flex flex-col page-enter" style={{ background: "transparent" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0" style={{ background: "var(--color-bg-card)", backdropFilter: "blur(22px)", borderBottom: "1px solid var(--color-border-default)" }}>
          <button onClick={() => setShowNotifications(false)} style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>← Back</button>
          <h1 style={{ fontFamily: "'Outfit', system-ui", fontSize: 18, fontWeight: 600, color: "var(--color-accent-dark)" }}>Notifications</h1>
          {unreadCount > 0 ? (
            <button onClick={markAllRead} style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 500, color: "var(--color-accent-dark)" }}>Mark all read</button>
          ) : <div className="w-10" />}
        </div>
        <div className="flex-1 overflow-y-auto pb-20">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontStyle: "italic", color: "var(--color-text-muted)" }}>No notifications yet 🌸</p>
            </div>
          ) : notifications.map(n => (
            <button key={n.id} onClick={() => handleNotifTap(n)}
              className="w-full text-left px-4 py-3 flex gap-3 belly-card-interactive" style={{ borderBottom: "1px solid var(--color-border-default)", opacity: n.is_read ? 0.6 : 1 }}>
              {!n.is_read && <div className="w-[3px] rounded-full self-stretch shrink-0" style={{ background: "var(--color-bg-card)" }} />}
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "var(--color-accent-dark)" }}>{n.title}</p>
                {n.body && <p className="text-[12px] leading-[1.4] mt-0.5 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{n.body}</p>}
              </div>
              <span className="text-[10px] shrink-0" style={{ color: "var(--color-text-muted)" }}>{timeAgo(n.created_at)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- POST DETAIL ---
  if (selectedPost) {
    const isSeeded = selectedPost.id.startsWith("seed-");
    return (
      <div className="fixed inset-0 z-[100] flex flex-col page-enter" style={{ background: "var(--color-bg-base)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0" style={{ background: "var(--color-bg-card)", backdropFilter: "blur(22px)", borderBottom: "1px solid var(--color-border-default)" }}>
          <button onClick={() => { setSelectedPost(null); fetchPosts(); }} style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>← Back</button>
          <span className="text-[9px] font-semibold px-[7px] py-[2px] rounded-[6px] capitalize" style={{ background: CATEGORY_PILL_COLORS[selectedPost.category] || "rgba(255,255,255,0.20)", color: "var(--color-accent-dark)" }}>
            {selectedPost.category}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
              style={{ background: "var(--color-bg-card)", color: "var(--color-accent-dark)" }}>
              {initials(selectedPost.author_name || "")}
            </div>
            <div>
              <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 600, color: "var(--color-accent-dark)" }}>{titleCase(selectedPost.author_name || "")}</span>
              <span className="text-[11px] ml-2" style={{ color: "var(--color-text-secondary)" }}>{timeAgo(selectedPost.created_at)}</span>
            </div>
            {selectedPost.week_posted && (
              <span className="text-[8px] px-[6px] py-[2px] rounded-[7px] ml-auto" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", color: "var(--color-accent-dark)", fontWeight: 600, fontFamily: "'Outfit', system-ui", fontSize: 9 }}>
                Week {selectedPost.week_posted}
              </span>
            )}
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--color-accent-dark)", marginBottom: 12 }}>{selectedPost.title}</h2>
          <p className="text-[14px] leading-[1.75] mb-4" style={{ color: "var(--color-text-secondary)", fontFamily: "'Outfit', system-ui" }}>{selectedPost.body}</p>
          <button onClick={() => toggleLike(selectedPost)}
            className={`flex items-center gap-1.5 text-[12px] mb-4 ${likeAnimating === selectedPost.id ? "heart-liked" : ""}`}
            style={{ color: selectedPost.is_liked ? "white" : "rgba(255,255,255,0.45)" }}>
            <Heart size={16} className={selectedPost.is_liked ? "fill-current" : ""} />
            {selectedPost.likes} likes
          </button>
          <div style={{ borderTop: "1px solid var(--color-border-default)", marginTop: 8, marginBottom: 8 }} />
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, marginTop: 16, color: "var(--color-text-secondary)", fontWeight: 600 }}>Replies</p>
          {comments.length === 0 ? (
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontStyle: "italic", textAlign: "center", padding: "20px 0", color: "var(--color-text-secondary)" }}>No replies yet. Be the first to respond! 💕</p>
          ) : comments.map((c: any) => (
            <div key={c.id} className="rounded-[14px] p-[12px_14px] mb-2" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0" style={{ background: "var(--color-bg-card)", color: "var(--color-accent-dark)" }}>
                  {initials(c.author_name)}
                </div>
                <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 600, color: "var(--color-accent-dark)" }}>{titleCase(c.author_name)}</span>
                <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-[13px] leading-[1.55] mt-1.5" style={{ color: "var(--color-text-secondary)", fontFamily: "'Outfit', system-ui" }}>{c.body}</p>
            </div>
          ))}
          <div className="h-4" />
        </div>
        <div className="shrink-0 px-4 pt-[10px]" style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))", zIndex: 101, position: "relative", background: "rgba(200,80,10,0.45)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--color-border-default)" }}>
          {replyError && <p className="text-[12px] mb-2" style={{ color: "#FFB899" }}>{replyError}</p>}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0" style={{ background: "var(--color-bg-card)", color: "var(--color-accent-dark)" }}>
              {initials(userName)}
            </div>
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              placeholder={isSeeded ? "Sign in to reply" : `Reply to ${titleCase(selectedPost.author_name || "")}...`}
              disabled={isSeeded || !user}
              className="flex-1 h-10 rounded-full px-4 text-[13px] outline-none disabled:opacity-50"
              style={{ background: "var(--input-bg)", color: "var(--color-text-primary)", fontFamily: "'Outfit', system-ui", fontStyle: "italic", border: "none" }} />
            <button onClick={addComment} disabled={!commentText.trim() || sendingReply || isSeeded || !user}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 belly-btn-primary"
              style={{ background: "#FF6520" }}>
              <Send size={14} style={{ color: "var(--color-accent-dark)" }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render a post card ---
  const categoryPillClass = (cat: string) =>
    cat === "story" ? "pill-sage"
    : cat === "question" ? "pill-terra"
    : cat === "tip" ? "pill-amber"
    : "pill-pink";

  const renderPostCard = (post: Post, isPinned: boolean) => (
    <button key={post.id} onClick={() => openPost(post)}
      className="w-full text-left belly-card-interactive"
      style={{
        background: "var(--color-bg-card)",
        border: "0.5px solid var(--color-border-default)",
        borderLeft: isPinned ? "3px solid var(--color-sage)" : "0.5px solid var(--color-border-default)",
        borderRadius: 18,
        padding: "16px 16px",
        position: "relative",
        boxShadow: "var(--shadow-card)",
      }}>
      {isPinned && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "var(--color-sage)", color: "#fff",
          borderRadius: 6, padding: "2px 8px",
          fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 9,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>PINNED</span>
      )}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--color-accent-light)", color: "var(--color-accent-dark)", fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 12 }}>
          {initials(post.author_name || "")}
        </div>
        <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{titleCase(post.author_name || "")}</span>
        {post.week_posted && (
          <span style={{
            background: "var(--color-bg-card-subtle)", border: "1px solid var(--color-border-default)",
            borderRadius: 8, padding: "2px 8px",
            fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 9, color: "var(--color-text-secondary)",
          }}>
            Week {post.week_posted}
          </span>
        )}
        <span className="ml-auto" style={{ color: "var(--color-text-muted)", fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 10 }}>{timeAgo(post.created_at)}</span>
      </div>
      <span className={`pill-base ${categoryPillClass(post.category)} capitalize`} style={{ fontSize: 10, padding: "3px 10px", marginBottom: 6 }}>
        {post.category}
      </span>
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 6, marginBottom: 4, lineHeight: 1.3 }}>{post.title}</p>
      <p className="line-clamp-2" style={{ color: "var(--color-text-secondary)", fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 13, lineHeight: 1.5 }}>{post.body}</p>
      <div className="flex items-center gap-[14px]" style={{ borderTop: "1px solid var(--color-border-default)", paddingTop: 10, marginTop: 12 }}>
        <button onClick={(e) => { e.stopPropagation(); toggleLike(post); }}
          className={`flex items-center gap-1.5 ${likeAnimating === post.id ? "heart-liked" : ""}`}
          style={{ color: post.is_liked ? "var(--color-accent-primary)" : "var(--color-text-muted)", fontSize: 13, fontFamily: "'Outfit', system-ui", fontWeight: 500 }}>
          <Heart size={15} className={post.is_liked ? "fill-current" : ""} /> {post.likes}
        </button>
        <span className="flex items-center gap-1.5" style={{ color: "var(--color-text-secondary)", fontSize: 13, fontFamily: "'Outfit', system-ui", fontWeight: 500 }}>
          <MessageCircle size={15} /> {post.comment_count}
        </span>
      </div>
    </button>
  );

  // --- FEED ---
  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "var(--color-bg-base)" }}>
      <div style={{ background: "#E8601A", padding: "14px 16px", boxShadow: "0 2px 8px rgba(120,60,10,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: "#fff", lineHeight: 1.1 }}>Mama Community</div>
          <div style={{ fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
            {currentWeek ? `Week ${currentWeek} mamas` : "Mamas"} · {posts.length} members
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.18)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <NotificationBell onOpenNotifications={() => setShowNotifications(true)} unreadCount={unreadCount} />
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 belly-btn-primary"
            style={{
              background: "#fff", color: "#E8601A",
              fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 13,
              borderRadius: 20, padding: "7px 16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.12)", border: "none",
            }}>
            <Plus size={14} /> Post
          </button>
        </div>
      </div>


      <div className="px-5 mb-4 hide-scrollbar" style={{ display: "flex", flexDirection: "row", overflowX: "auto", flexWrap: "nowrap", gap: 8, paddingTop: 14, paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="whitespace-nowrap transition-all belly-btn-press"
            style={{
              flexShrink: 0,
              background: activeCategory === cat ? "var(--color-accent-primary)" : "var(--color-bg-card)",
              color: activeCategory === cat ? "#fff" : "var(--color-text-secondary)",
              fontWeight: activeCategory === cat ? 700 : 500,
              fontSize: 12,
              fontFamily: "'Outfit', system-ui",
              border: activeCategory === cat ? "none" : "1px solid var(--color-border-default)",
              borderRadius: 20,
              padding: "6px 14px",
            }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-2">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="rounded-[18px] p-4 animate-pulse h-32" style={{ background: "var(--color-bg-card)" }} />)
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--color-bg-card)" }}><span className="text-2xl">💕</span></div>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 16, fontWeight: 600, color: "var(--color-accent-dark)" }}>Be the first to share your story</p>
            <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>Start a conversation with other mamas</p>
          </div>
        ) : (
          <>
            {pinnedPost && renderPostCard(pinnedPost, true)}
            {remainingPosts.map(post => renderPostCard(post, false))}
          </>
        )}
      </div>

      {/* Create post bottom-sheet modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[200] flex items-start"
          style={{ background: "rgba(40, 20, 5, 0.45)" }}
          onClick={() => { setShowCreate(false); setPostError(""); }}
        >
          <div
            className="w-full flex flex-col sheet-down relative"
            style={{
              background: "var(--color-bg-base)",
              borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
              height: "85vh", maxWidth: 430, margin: "0 auto",
              boxShadow: "0 10px 40px rgba(40,20,5,0.18)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowCreate(false); setPostError(""); }} aria-label="Close"
              style={{
                position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%",
                background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
              <span style={{ color: "var(--color-text-primary)", fontSize: 16, lineHeight: 1 }}>×</span>
            </button>

            <div className="px-5 pt-5 pb-2 shrink-0">
              <h2 className="font-serif-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)" }}>Share with the mamas</h2>
              <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                Your story might be the one another mama needs today
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-5" style={{ paddingBottom: 24 }}>
              <p className="section-label" style={{ marginBottom: 8 }}>POST TYPE</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {[
                  { key: "question", label: "Questions", cls: "pill-terra" },
                  { key: "story", label: "Stories", cls: "pill-sage" },
                  { key: "tip", label: "Tips", cls: "pill-amber" },
                  { key: "support", label: "Support", cls: "pill-pink" },
                ].map(cat => (
                  <button key={cat.key} onClick={() => setNewCategory(cat.key)}
                    className={`pill-base belly-btn-press ${cat.cls}`}
                    style={{
                      fontWeight: newCategory === cat.key ? 700 : 500,
                      fontSize: 12,
                      border: newCategory === cat.key ? "1.5px solid var(--color-accent-primary)" : "1px solid transparent",
                      cursor: "pointer",
                    }}>
                    {cat.label}
                  </button>
                ))}
              </div>

              <p className="section-label" style={{ marginBottom: 8 }}>TITLE</p>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Give your post a title..."
                className="w-full text-[15px] outline-none mb-4 belly-input-focus"
                style={{ background: "var(--color-bg-card)", color: "var(--color-text-primary)", fontFamily: "'Outfit', system-ui", border: "1px solid var(--color-border-default)", borderRadius: 14, padding: "12px 16px" }} />

              <p className="section-label" style={{ marginBottom: 8 }}>YOUR MESSAGE</p>
              <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="What's on your mind, mama?" rows={6}
                className="w-full text-[14px] outline-none resize-none mb-5 belly-input-focus"
                style={{ background: "var(--color-bg-card)", color: "var(--color-text-primary)", fontFamily: "'Outfit', system-ui", border: "1px solid var(--color-border-default)", borderRadius: 14, padding: "12px 16px", minHeight: 160 }} />

              <button onClick={createPost} disabled={!newTitle.trim() || !newBody.trim() || posting}
                className="w-full belly-btn-press"
                style={{
                  background: "var(--color-accent-primary)", color: "#fff",
                  fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 15,
                  borderRadius: 999, height: 52, border: "none",
                  boxShadow: "var(--shadow-warm)",
                  opacity: (!newTitle.trim() || !newBody.trim() || posting) ? 0.4 : 1,
                  cursor: (!newTitle.trim() || !newBody.trim() || posting) ? "not-allowed" : "pointer",
                }}>
                {posting ? "Posting…" : "Post it →"}
              </button>
              {postError && <p className="text-[12px] text-center mt-2" style={{ color: "var(--color-danger)" }}>{postError}</p>}
            </div>
            <div className="pt-1 pb-3 flex justify-center shrink-0">
              <div style={{ width: 44, height: 5, borderRadius: 5, background: "var(--color-border-strong)" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
