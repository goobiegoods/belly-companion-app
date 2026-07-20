import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { Heart, MessageCircle, Send, Sparkles, EyeOff } from "lucide-react";
import { toast } from "sonner";
import NotificationBell, { useNotifications } from "@/components/NotificationBell";
import { getDisplayName, isSensitiveStory, BELLY_HOST_USER_ID } from "@/lib/community";
import { SceneBackground, GhHeader } from "@/components/golden";
import { useVvLock } from "@/lib/viewport";

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  week_posted: number | null;
  likes: number;
  created_at: string;
  is_pinned?: boolean;
  display_name?: string | null;
  author_name?: string;
  comment_count?: number;
  is_liked?: boolean;
}

const CATEGORIES = ["All", "Questions", "Stories", "Tips", "Support"];
const CATEGORY_KEYS: Record<string, string> = { Questions: "question", Stories: "story", Tips: "tip", Support: "support" };
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_KEYS).map(([label, key]) => [key, label])
);

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #ffb187, var(--ember))",
  "linear-gradient(135deg, #7fe0d3, var(--teal))",
  "linear-gradient(135deg, #f79fc0, var(--magenta))",
];
const avatarGradient = (name: string) =>
  AVATAR_GRADIENTS[(name?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length];

const titleCase = (s: string) => {
  const safe = getDisplayName({ first_name: s });
  return safe.split(" ").map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

const Community = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mamasCount, setMamasCount] = useState<number | null>(null);
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
  const [revealedSensitive, setRevealedSensitive] = useState<Set<string>>(new Set());

  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;
  useVvLock(!!selectedPost);

  // Close the detail view and land on the feed filtered to this category.
  const filterByCategory = (categoryKey: string) => {
    setSelectedPost(null);
    const label = CATEGORY_LABELS[categoryKey] ?? "All";
    if (label !== activeCategory) setActiveCategory(label);
    else fetchPosts();
  };

  const handleNotifTap = async (notif: { id: string; post_id: string | null; is_read: boolean; title: string; body: string | null; created_at: string }) => {
    await markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.post_id) {
      const { data } = await supabase.from("posts").select("*").eq("id", notif.post_id).single();
      if (data) {
        const { data: prof } = await supabase.from("profiles").select("first_name").eq("user_id", data.user_id).single();
        openPost({ ...data, author_name: data.display_name || prof?.first_name || "Mama", comment_count: 0, is_liked: false });
      }
    }
  };

  // Real member count for the "mamas tonight" tag.
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setMamasCount(count ?? null));
  }, []);

  const fetchPosts = async () => {
    let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (activeCategory !== "All") query = query.eq("category", CATEGORY_KEYS[activeCategory]);
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
      const dbPosts = data.map(p => ({ ...p, author_name: p.display_name || nameMap[p.user_id] || "Mama", comment_count: countMap[p.id] || 0, is_liked: !!likeMap[p.id] }));
      setPosts(dbPosts);
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [activeCategory]);

  const createPost = async () => {
    if (!newTitle.trim() || !newBody.trim() || !user) return;
    setPosting(true); setPostError("");
    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, title: newTitle.trim(), body: newBody.trim(), category: newCategory, week_posted: currentWeek, display_name: profile?.first_name || "Mama" })
      .select()
      .single();
    if (error || !inserted) { setPostError("Something went wrong. Please try again."); setPosting(false); return; }
    const newPost: Post = {
      ...(inserted as any),
      author_name: profile?.first_name || "Mama",
      comment_count: 0,
      is_liked: false,
    };
    setPosts(prev => [newPost, ...prev]);
    setShowCreate(false); setNewTitle(""); setNewBody(""); setNewCategory("question"); setPosting(false);
    toast.success("Your post is live! ✨");
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    setLikeAnimating(post.id);
    setTimeout(() => setLikeAnimating(null), 400);

    const nextLiked = !post.is_liked;
    const nextLikes = Math.max(0, post.likes + (nextLiked ? 1 : -1));
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_liked: nextLiked, likes: nextLikes } : p));
    setSelectedPost(prev => prev && prev.id === post.id ? { ...prev, is_liked: nextLiked, likes: nextLikes } : prev);

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
    if (!commentText.trim() || !user || !selectedPost) return;
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

  const pinnedPost = posts.find(p => p.is_pinned) ?? (posts.length > 0 ? [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] : null);
  const remainingPosts = pinnedPost ? posts.filter(p => p.id !== pinnedPost.id) : posts;

  const Avatar = ({ name, size = 28 }: { name: string; size?: number }) => (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace", fontSize: size * 0.4, fontWeight: 600,
        color: "var(--night)", flexShrink: 0, background: avatarGradient(name),
      }}
    >
      {initials(name)}
    </div>
  );

  // --- NOTIFICATIONS ---
  if (showNotifications) {
    return (
      <SceneBackground scene="mamas">
        <div style={{ minHeight: "100dvh", paddingBottom: 90 }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <button onClick={() => setShowNotifications(false)} style={{ fontFamily: "'Inter', system-ui", fontSize: 12, fontWeight: 600, color: "rgba(251,238,224,0.7)" }}>← Back</button>
            <h1 className="font-gh-serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--cream)" }}>Notifications</h1>
            {unreadCount > 0 ? (
              <button onClick={markAllRead} style={{ fontFamily: "'Inter', system-ui", fontSize: 11, fontWeight: 500, color: "var(--gold)" }}>Mark all read</button>
            ) : <div className="w-10" />}
          </div>
          <div className="overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(251,238,224,0.5)" }}>No notifications yet ✨</p>
              </div>
            ) : notifications.map(n => (
              <button key={n.id} onClick={() => handleNotifTap(n)}
                className="w-full text-left px-4 py-3 flex gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", opacity: n.is_read ? 0.55 : 1 }}>
                {!n.is_read && <div className="w-[3px] rounded-full self-stretch shrink-0" style={{ background: "var(--gold)" }} />}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>{n.title}</p>
                  {n.body && <p className="text-[12px] leading-[1.4] mt-0.5 line-clamp-2" style={{ color: "rgba(251,238,224,0.65)" }}>{n.body}</p>}
                </div>
                <span className="text-[10px] shrink-0 font-gh-mono" style={{ color: "rgba(251,238,224,0.5)" }}>{timeAgo(n.created_at)}</span>
              </button>
            ))}
          </div>
        </div>
      </SceneBackground>
    );
  }

  // --- POST DETAIL ---
  if (selectedPost) {
    const isHostPost = selectedPost.user_id === BELLY_HOST_USER_ID;
    const sensitive = isSensitiveStory(selectedPost.category, selectedPost.title, selectedPost.body);
    const bodyRevealed = !sensitive || revealedSensitive.has(selectedPost.id);
    return (
      <div className="fixed top-0 inset-x-0 z-[100] gh-scene-mamas" style={{ maxWidth: 430, margin: "0 auto", height: "var(--vvh, 100dvh)", display: "flex", flexDirection: "column", color: "var(--cream)", fontFamily: "'Inter', system-ui" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <button onClick={() => { setSelectedPost(null); fetchPosts(); }} style={{ fontSize: 12, fontWeight: 600, color: "rgba(251,238,224,0.7)" }}>← Back</button>
          <button
            onClick={() => filterByCategory(selectedPost.category)}
            aria-label={`See all ${CATEGORY_LABELS[selectedPost.category] ?? "posts"}`}
            className="font-gh-mono capitalize belly-btn-press"
            style={{ fontSize: 10, padding: "3px 10px", borderRadius: 10, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", color: "var(--cream)", cursor: "pointer" }}
          >
            {selectedPost.category}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Avatar name={selectedPost.author_name || ""} size={34} />
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)" }}>{titleCase(selectedPost.author_name || "")}</span>
              {isHostPost && (
                <span className="flex items-center gap-1" style={{
                  background: "rgba(44,156,143,0.18)", color: "var(--teal)", border: "1px solid rgba(44,156,143,0.4)",
                  borderRadius: 10, padding: "2px 8px", fontWeight: 700, fontSize: 9.5, letterSpacing: "0.04em",
                }}>
                  <Sparkles size={9} /> belly team
                </span>
              )}
              <span className="text-[11px]" style={{ color: "rgba(251,238,224,0.55)" }}>{timeAgo(selectedPost.created_at)}</span>
            </div>
            {selectedPost.week_posted && (
              <span className="font-gh-mono ml-auto" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(251,238,224,0.7)" }}>
                wk {selectedPost.week_posted}
              </span>
            )}
          </div>
          <h2 className="font-gh-serif" style={{ fontSize: 22, fontWeight: 500, color: "var(--cream)", marginBottom: 12, lineHeight: 1.3 }}>{selectedPost.title}</h2>
          {bodyRevealed ? (
            <p className="text-[14px] leading-[1.75] mb-4" style={{ color: "rgba(251,238,224,0.8)" }}>{selectedPost.body}</p>
          ) : (
            <button
              onClick={() => setRevealedSensitive(prev => new Set(prev).add(selectedPost.id))}
              className="w-full flex items-center gap-2 justify-center gh-glass-subtle mb-4"
              style={{ padding: "16px 14px", fontSize: 13, color: "rgba(251,238,224,0.75)" }}
            >
              <EyeOff size={15} />
              This post discusses a sensitive topic — tap to read
            </button>
          )}
          <button onClick={() => toggleLike(selectedPost)}
            className={`flex items-center gap-1.5 text-[12px] mb-4 ${likeAnimating === selectedPost.id ? "heart-liked" : ""}`}
            style={{ color: selectedPost.is_liked ? "var(--gold)" : "rgba(251,238,224,0.55)" }}>
            <Heart size={16} className={selectedPost.is_liked ? "fill-current" : ""} />
            {selectedPost.likes} likes
          </button>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 8, marginBottom: 8 }} />
          <p className="gh-section-label" style={{ marginTop: 16, marginBottom: 12 }}>replies</p>
          {comments.length === 0 ? (
            <p style={{ fontSize: 13, fontStyle: "italic", textAlign: "center", padding: "20px 0", color: "rgba(251,238,224,0.6)" }}>
              No replies yet. Be the first to respond.
            </p>
          ) : comments.map((c: any) => (
            <div key={c.id} className="gh-glass-subtle p-[12px_14px] mb-2">
              <div className="flex items-center gap-2">
                <Avatar name={c.author_name} size={26} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cream)" }}>{titleCase(c.author_name)}</span>
                <span className="text-[10px]" style={{ color: "rgba(251,238,224,0.5)" }}>{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-[13px] leading-[1.55] mt-1.5" style={{ color: "rgba(251,238,224,0.8)" }}>{c.body}</p>
            </div>
          ))}
          <div className="h-4" />
        </div>
        <div className="shrink-0 px-4 pt-[10px]" style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))", background: "rgba(10,6,16,0.55)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          {replyError && <p className="text-[12px] mb-2" style={{ color: "#ffb187" }}>{replyError}</p>}
          <div className="flex items-center gap-2">
            <Avatar name={userName} size={30} />
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              placeholder={`Reply to ${titleCase(selectedPost.author_name || "")}...`}
              disabled={!user}
              className="flex-1 h-10 rounded-full px-4 text-[13px] outline-none disabled:opacity-50"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "var(--cream)" }} />
            <button onClick={addComment} disabled={!commentText.trim() || sendingReply || !user}
              className="gh-arrow-btn shrink-0 disabled:opacity-40" style={{ width: 36, height: 36 }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render a post card ---
  const renderPostCard = (post: Post, isPinned: boolean) => {
    const isHostPost = post.user_id === BELLY_HOST_USER_ID;
    const sensitive = isSensitiveStory(post.category, post.title, post.body);
    return (
    <button key={post.id} onClick={() => openPost(post)}
      className="w-full text-left gh-glass-subtle belly-card-interactive"
      style={{
        padding: "14px 15px",
        marginBottom: 9,
        position: "relative",
        ...(isPinned ? { borderLeft: "3px solid var(--gold)", borderRadius: "0 16px 16px 0" } : {}),
      }}>
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar name={post.author_name || ""} />
        <span style={{ fontSize: 11.5, color: "rgba(251,238,224,0.65)", flex: 1 }}>
          {titleCase(post.author_name || "")}{post.week_posted ? ` · wk ${post.week_posted}` : ""}
        </span>
        {isHostPost && (
          <span className="flex items-center gap-1" style={{
            background: "rgba(44,156,143,0.18)", color: "var(--teal)", border: "1px solid rgba(44,156,143,0.4)",
            borderRadius: 10, padding: "3px 9px", fontWeight: 700, fontSize: 9.5, letterSpacing: "0.04em",
          }}>
            <Sparkles size={9} /> belly team
          </span>
        )}
        {isPinned && (
          <span style={{
            background: "var(--gold)", color: "#2a1305",
            borderRadius: 10, padding: "3px 9px",
            fontWeight: 700, fontSize: 9.5, letterSpacing: "0.04em",
          }}>pinned</span>
        )}
      </div>
      <p className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--cream)", margin: "0 0 6px", lineHeight: 1.35 }}>{post.title}</p>
      {sensitive ? (
        <p className="flex items-center gap-1.5" style={{ color: "rgba(251,238,224,0.55)", fontSize: 12.5, lineHeight: 1.5, marginBottom: 9, fontStyle: "italic" }}>
          <EyeOff size={12} /> Sensitive topic — tap to read
        </p>
      ) : (
        <p className="line-clamp-2" style={{ color: "rgba(251,238,224,0.6)", fontSize: 12.5, lineHeight: 1.5, marginBottom: 9 }}>{post.body}</p>
      )}
      <div className="flex items-center gap-[14px]" style={{ fontSize: 11.5, color: "rgba(251,238,224,0.6)" }}>
        <button onClick={(e) => { e.stopPropagation(); toggleLike(post); }}
          className={`flex items-center gap-1.5 ${likeAnimating === post.id ? "heart-liked" : ""}`}
          style={{ color: post.is_liked ? "var(--gold)" : "rgba(251,238,224,0.6)" }}>
          <Heart size={13} style={{ stroke: "var(--gold)" }} className={post.is_liked ? "fill-[var(--gold)]" : ""} />
          {post.likes > 0 ? post.likes : "new"}
        </button>
        <span className="flex items-center gap-1.5">
          <MessageCircle size={13} style={{ stroke: "var(--gold)" }} /> {post.comment_count > 0 ? post.comment_count : "be first"}
        </span>
      </div>
    </button>
    );
  };

  // --- FEED ---
  return (
    <SceneBackground scene="mamas">
      <GhHeader
        brand="Mama community"
        tag={`week ${currentWeek ?? "—"} · ${mamasCount ?? posts.length} mamas tonight`}
        brandSize={20}
        glowStyle={{ right: 10, top: -70 }}
        right={
          <>
            <div className="gh-icon-btn" style={{ overflow: "visible" }}>
              <NotificationBell onOpenNotifications={() => setShowNotifications(true)} unreadCount={unreadCount} />
            </div>
            <button onClick={() => setShowCreate(true)} className="gh-post-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--ember)" strokeWidth="2.6" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              post
            </button>
          </>
        }
      />

      <div style={{ padding: "4px 16px 110px" }}>
        <div className="hide-scrollbar" style={{ display: "flex", overflowX: "auto", gap: 8, marginBottom: 13 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`gh-pill ${activeCategory === cat ? "gh-pill-filled" : ""}`}
              style={{ flexShrink: 0 }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="gh-glass-subtle animate-pulse h-32" style={{ marginBottom: 9 }} />)
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center gh-glass-subtle"><MessageCircle size={22} style={{ color: "var(--gold)" }} /></div>
            <p className="font-gh-serif" style={{ fontSize: 16, fontWeight: 500, color: "var(--cream)" }}>Be the first to share your story</p>
            <p className="text-[11px]" style={{ color: "rgba(251,238,224,0.6)" }}>Start a conversation with other mamas</p>
          </div>
        ) : (
          <>
            {pinnedPost && renderPostCard(pinnedPost, true)}
            {remainingPosts.map(post => renderPostCard(post, false))}
          </>
        )}
      </div>

      {/* Create post sheet — portaled to <body>: SceneBackground wraps children in a
          z-index:2 stacking context, which would trap this overlay under the z-50 nav */}
      {showCreate && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-end"
          style={{ background: "rgba(10,6,16,0.6)" }}
          onClick={() => { setShowCreate(false); setPostError(""); }}
        >
          <div
            className="w-full flex flex-col sheet-enter relative"
            style={{
              background: "linear-gradient(180deg, #2a1430 0%, #1c0e24 100%)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderBottom: "none",
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              maxHeight: "88dvh", maxWidth: 430, margin: "0 auto",
              color: "var(--cream)", fontFamily: "'Inter', system-ui",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div style={{ width: 44, height: 5, borderRadius: 5, background: "rgba(255,255,255,0.25)" }} />
            </div>
            <button onClick={() => { setShowCreate(false); setPostError(""); }} aria-label="Close"
              className="gh-icon-btn"
              style={{ position: "absolute", top: 14, right: 14 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>×</span>
            </button>

            <div className="px-5 pt-3 pb-2 shrink-0">
              <h2 className="font-gh-serif" style={{ fontSize: 22, fontWeight: 500, fontStyle: "italic" }}>Share with the mamas</h2>
              <p style={{ fontSize: 12, color: "rgba(251,238,224,0.6)", marginTop: 2 }}>
                Your story might be the one another mama needs today
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-5" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
              <p className="gh-section-label" style={{ marginBottom: 8 }}>post type</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {[
                  { key: "question", label: "Questions" },
                  { key: "story", label: "Stories" },
                  { key: "tip", label: "Tips" },
                  { key: "support", label: "Support" },
                ].map(cat => (
                  <button key={cat.key} onClick={() => setNewCategory(cat.key)}
                    className={`gh-pill ${newCategory === cat.key ? "gh-pill-filled" : ""}`}>
                    {cat.label}
                  </button>
                ))}
              </div>

              <p className="gh-section-label" style={{ marginBottom: 8 }}>title</p>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Give your post a title..."
                className="w-full text-[15px] outline-none mb-4"
                style={{ background: "rgba(0,0,0,0.25)", color: "var(--cream)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px" }} />

              <p className="gh-section-label" style={{ marginBottom: 8 }}>your message</p>
              <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="What's on your mind, mama?" rows={6}
                className="w-full text-[14px] outline-none resize-none mb-2"
                style={{ background: "rgba(0,0,0,0.25)", color: "var(--cream)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px", minHeight: 140 }} />
            </div>

            {/* Pinned footer: the Post button must stay reachable even with the keyboard up */}
            <div className="shrink-0 px-5"
              style={{
                paddingTop: 12,
                paddingBottom: "max(20px, env(safe-area-inset-bottom))",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                background: "#1c0e24",
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
              }}>
              <button onClick={createPost} disabled={!newTitle.trim() || !newBody.trim() || posting}
                className="w-full belly-btn-press"
                style={{
                  background: "linear-gradient(135deg, var(--gold), var(--ember))",
                  color: "var(--night)",
                  fontWeight: 700, fontSize: 15,
                  borderRadius: 999, height: 52, border: "none",
                  opacity: (!newTitle.trim() || !newBody.trim() || posting) ? 0.4 : 1,
                  cursor: (!newTitle.trim() || !newBody.trim() || posting) ? "not-allowed" : "pointer",
                }}>
                {posting ? "Posting…" : "Post it →"}
              </button>
              {postError && <p className="text-[12px] text-center mt-2" style={{ color: "#ffb187" }}>{postError}</p>}
            </div>
          </div>
        </div>,
        document.body
      )}
    </SceneBackground>
  );
};

export default Community;
