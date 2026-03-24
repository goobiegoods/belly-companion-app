import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { Heart, MessageCircle, Plus, Send, Bell } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  week_posted: number | null;
  likes: number;
  created_at: string;
  author_name?: string;
  comment_count?: number;
  is_liked?: boolean;
}

interface Notification {
  id: string;
  title: string;
  body: string | null;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
}

const CATEGORIES = ["All", "Questions", "Stories", "Tips", "Support"];

const SEEDED_POSTS: Post[] = [
  { id: "seed-1", user_id: "", title: "Anyone else exhausted in week 8?", body: "I can barely keep my eyes open past 7pm. Is this normal? My partner thinks I'm being dramatic but I literally cannot function. Please tell me it gets better 😭", category: "question", week_posted: 8, likes: 12, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), author_name: "Sarah", comment_count: 4, is_liked: false },
  { id: "seed-2", user_id: "", title: "Ginger chews changed my life", body: "I was so skeptical but the Chimes ginger chews from Whole Foods have been a lifesaver for my morning sickness. Keeping them in my bag at all times. Highly recommend to any first trimester mama!", category: "tip", week_posted: 9, likes: 34, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), author_name: "Emma", comment_count: 8, is_liked: false },
  { id: "seed-3", user_id: "", title: "I heard the heartbeat today 💕", body: "Week 10 and I finally heard it. I've been so anxious this whole pregnancy and honestly cried for 10 minutes straight. It made everything feel so real. Sending love to anyone waiting for that moment — it's worth every scary second.", category: "story", week_posted: 10, likes: 67, created_at: new Date(Date.now() - 86400000 * 1).toISOString(), author_name: "Jessica", comment_count: 15, is_liked: false },
  { id: "seed-4", user_id: "", title: "Feeling really alone in this", body: "My partner is supportive but doesn't really get it. My mom keeps giving unsolicited advice. I just want someone who GETS it. Is anyone else feeling isolated during their pregnancy? How do you cope?", category: "support", week_posted: 12, likes: 28, created_at: new Date(Date.now() - 86400000 * 4).toISOString(), author_name: "Maya", comment_count: 11, is_liked: false },
  { id: "seed-5", user_id: "", title: "Second trimester energy — when does it kick in?", body: "Everyone says you get your energy back in the second trimester but I'm week 15 and still dragging. When did it actually happen for you guys?", category: "question", week_posted: 15, likes: 19, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), author_name: "Olivia", comment_count: 7, is_liked: false },
  { id: "seed-6", user_id: "", title: "Left side sleeping hack", body: "Put a pillow between your knees AND one behind your back. Game changer. I finally slept 7 hours straight for the first time in weeks. The pregnancy pillow is 100% worth it.", category: "tip", week_posted: 22, likes: 45, created_at: new Date(Date.now() - 86400000 * 6).toISOString(), author_name: "Rachel", comment_count: 12, is_liked: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  question: "#FFF0E8",
  story: "#FFE8F0",
  tip: "#F0FAF4",
  support: "#FFF4E8",
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
  };

  const markAsRead = async (notif: Notification) => {
    if (notif.is_read) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
  };

  const handleNotifTap = async (notif: Notification) => {
    await markAsRead(notif);
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
    if (activeCategory !== "All") {
      query = query.eq("category", activeCategory.toLowerCase().slice(0, -1));
    }
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

      const dbPosts = data.map(p => ({
        ...p,
        author_name: nameMap[p.user_id] || "Mama",
        comment_count: countMap[p.id] || 0,
        is_liked: !!likeMap[p.id],
      }));

      const realTitles = new Set(dbPosts.map(p => p.title));
      const filtered = SEEDED_POSTS.filter(s => !realTitles.has(s.title));
      if (activeCategory !== "All") {
        const catKey = activeCategory.toLowerCase().slice(0, -1);
        setPosts([...dbPosts, ...filtered.filter(s => s.category === catKey)]);
      } else {
        setPosts([...dbPosts, ...filtered]);
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
  useEffect(() => { fetchNotifications(); }, [user]);

  const createPost = async () => {
    if (!newTitle.trim() || !user) return;
    setPosting(true);
    setPostError("");
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title: newTitle.trim(),
      body: newBody.trim(),
      category: newCategory,
      week_posted: currentWeek,
    });
    if (error) {
      setPostError("Something went wrong. Please try again.");
      setPosting(false);
      return;
    }
    setShowCreate(false);
    setNewTitle("");
    setNewBody("");
    setNewCategory("question");
    setPosting(false);
    toast.success("Your post is live! 🌸");
    fetchPosts();
  };

  const toggleLike = async (post: Post) => {
    if (!user || post.id.startsWith("seed-")) return;
    if (post.is_liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      await supabase.from("posts").update({ likes: Math.max(0, post.likes - 1) }).eq("id", post.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
      await supabase.from("posts").update({ likes: post.likes + 1 }).eq("id", post.id);
    }
    fetchPosts();
  };

  const openPost = async (post: Post) => {
    setSelectedPost(post);
    setReplyError("");
    if (post.id.startsWith("seed-")) { setComments([]); return; }
    const { data } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, first_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profiles?.forEach(p => { nameMap[p.user_id] = p.first_name || "Mama"; });
      setComments(data.map(c => ({ ...c, author_name: nameMap[c.user_id] || "Mama" })));
    } else {
      setComments([]);
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !user || !selectedPost || selectedPost.id.startsWith("seed-")) return;
    setSendingReply(true);
    setReplyError("");
    const body = commentText.trim();
    // Optimistic update
    const optimisticComment = {
      id: "temp-" + Date.now(),
      post_id: selectedPost.id,
      user_id: user.id,
      body,
      created_at: new Date().toISOString(),
      author_name: profile?.first_name || "Mama",
    };
    setComments(prev => [...prev, optimisticComment]);
    setCommentText("");

    const { error } = await supabase.from("comments").insert({ post_id: selectedPost.id, user_id: user.id, body });
    setSendingReply(false);
    if (error) {
      // Rollback optimistic
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setReplyError("Couldn't send. Try again.");
      setCommentText(body);
      return;
    }
    // Refetch to get real id
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

  // --- NOTIFICATIONS SHEET ---
  if (showNotifications) {
    return (
      <div className="h-screen flex flex-col" style={{ background: "#FFF8F5" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-white shrink-0" style={{ borderBottom: "1px solid #FFE4D4" }}>
          <button onClick={() => setShowNotifications(false)} className="text-[12px] font-semibold" style={{ color: "#D4906A" }}>← Back</button>
          <h1 className="font-display text-[18px] font-bold" style={{ color: "#2A1200" }}>Notifications</h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto pb-20">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-[13px] italic" style={{ color: "#D4B0A0" }}>No notifications yet 🌸</p>
            </div>
          ) : (
            notifications.map(n => (
              <button key={n.id} onClick={() => handleNotifTap(n)}
                className="w-full text-left px-4 py-3 flex gap-3" style={{ borderBottom: "1px solid #FFF0E8", opacity: n.is_read ? 0.6 : 1 }}>
                {!n.is_read && <div className="w-[3px] rounded-full self-stretch shrink-0" style={{ background: "#FFB899" }} />}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{n.title}</p>
                  {n.body && <p className="text-[12px] leading-[1.4] mt-0.5 line-clamp-2" style={{ color: "#D4906A" }}>{n.body}</p>}
                </div>
                <span className="text-[10px] shrink-0" style={{ color: "#D4B0A0" }}>{timeAgo(n.created_at)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- POST DETAIL ---
  if (selectedPost) {
    const isSeeded = selectedPost.id.startsWith("seed-");
    return (
      <div className="fixed inset-0 z-40 flex flex-col" style={{ background: "#FFF8F5" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-white shrink-0" style={{ borderBottom: "1px solid #FFE4D4" }}>
          <button onClick={() => { setSelectedPost(null); fetchPosts(); }} className="text-[12px] font-semibold" style={{ color: "#D4906A" }}>← Back</button>
          <span className="text-[10px] font-semibold px-[10px] py-[3px] rounded-full capitalize" style={{ background: CATEGORY_COLORS[selectedPost.category] || "#FFF0E8", color: "#D4906A" }}>
            {selectedPost.category}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0" style={{ background: "#FFF0E8", color: "#D4906A" }}>
              {initials(selectedPost.author_name || "")}
            </div>
            <div>
              <span className="text-[14px] font-semibold" style={{ color: "#2A1200" }}>{selectedPost.author_name}</span>
              <span className="text-[11px] ml-2" style={{ color: "#D4B0A0" }}>{timeAgo(selectedPost.created_at)}</span>
            </div>
            {selectedPost.week_posted && (
              <span className="text-[9.5px] px-[9px] py-[2px] rounded-full ml-auto" style={{ background: "#FFF4EE", border: "1px solid #FFCDB4", color: "#D4906A" }}>
                Week {selectedPost.week_posted} mama
              </span>
            )}
          </div>

          <h2 className="font-display text-[22px] font-bold mb-3" style={{ color: "#2A1200", textTransform: "none" }}>{selectedPost.title}</h2>
          <p className="text-[14px] leading-[1.75] mb-4" style={{ color: "#2A1200" }}>{selectedPost.body}</p>

          <button onClick={() => toggleLike(selectedPost)} className="flex items-center gap-1.5 text-[12px] mb-4" style={{ color: "#D4B0A0" }}>
            <Heart size={16} className={selectedPost.is_liked ? "fill-current" : ""} style={selectedPost.is_liked ? { color: "#D4906A" } : {}} />
            {selectedPost.likes} likes
          </button>

          <div className="h-[1px] my-2" style={{ background: "#FFE4D4" }} />

          <p className="text-[10px] uppercase tracking-wider mb-3 mt-4" style={{ color: "#D4B0A0", letterSpacing: "0.1em" }}>Replies</p>

          {comments.length === 0 ? (
            <p className="text-[13px] font-display italic text-center py-5" style={{ color: "#D4B0A0" }}>
              No replies yet. Be the first to respond! 💕
            </p>
          ) : (
            comments.map((c: any) => (
              <div key={c.id} className="rounded-[14px] p-[12px_14px] mb-2" style={{ background: "#FFFFFF", border: "1px solid #FFE4D4" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0" style={{ background: "#FFF0E8", color: "#D4906A" }}>
                    {initials(c.author_name)}
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: "#2A1200" }}>{c.author_name}</span>
                  <span className="text-[10px]" style={{ color: "#D4B0A0" }}>{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-[13px] leading-[1.55] mt-1.5" style={{ color: "#2A1200" }}>{c.body}</p>
              </div>
            ))
          )}
          <div className="h-4" />
        </div>

        {/* Sticky reply bar */}
        <div className="shrink-0 bg-white px-4 pt-[10px]" style={{ borderTop: "1px solid #FFE4D4", paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
          {replyError && (
            <p className="text-[12px] mb-2" style={{ color: "#D4906A" }}>{replyError}</p>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0" style={{ background: "#FFF0E8", color: "#D4906A" }}>
              {initials(userName)}
            </div>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              placeholder={isSeeded ? "Sign in to reply" : `Reply to ${selectedPost.author_name}...`}
              disabled={isSeeded || !user}
              className="flex-1 h-10 rounded-[22px] px-4 text-[13px] font-display italic outline-none disabled:opacity-50"
              style={{ border: "1px solid #FFE4D4", background: "#FFF8F5", color: "#2A1200" }}
            />
            <button
              onClick={addComment}
              disabled={!commentText.trim() || sendingReply || isSeeded || !user}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-[0.92] transition-transform"
              style={{ background: "#FFB899" }}
            >
              <Send size={14} style={{ color: "#2A1200" }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FEED ---
  return (
    <div className="min-h-screen pb-20" style={{ background: "#FFF8F5" }}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold" style={{ color: "#2A1200" }}>Community</h1>
          <p className="text-[11px]" style={{ color: "#D4B0A0" }}>You're not alone in this</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifications(true)} className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FFF0E8" }}>
            <Bell size={16} style={{ color: "#D4906A" }} />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#FF6B6B" }} />
            )}
          </button>
          <button onClick={() => setShowCreate(true)} className="rounded-full px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1 active:scale-[0.95] transition-transform"
            style={{ background: "#FFB899", color: "#2A1200" }}>
            <Plus size={14} /> Post
          </button>
        </div>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all"
            style={{
              background: activeCategory === cat ? "#FFB899" : "#FFF0E8",
              color: activeCategory === cat ? "#2A1200" : "#D4906A",
              fontWeight: activeCategory === cat ? 600 : 500,
              border: activeCategory === cat ? "none" : "1px solid #FFE4D4"
            }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="rounded-[16px] p-4 animate-pulse h-32" style={{ background: "white", border: "1px solid #FFE4D4" }} />)
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "#FFF0E8" }}><span className="text-2xl">💕</span></div>
            <p className="font-display text-[16px] font-bold mb-1" style={{ color: "#2A1200" }}>Be the first to share your story</p>
            <p className="text-[11px]" style={{ color: "#D4B0A0" }}>Start a conversation with other mamas</p>
          </div>
        ) : (
          posts.map(post => (
            <button key={post.id} onClick={() => openPost(post)}
              className="w-full rounded-[16px] p-[14px_16px] text-left active:scale-[0.975] transition-transform"
              style={{ background: "white", border: "1px solid #FFE4D4" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: "#FFF0E8", color: "#D4906A" }}>
                  {initials(post.author_name || "")}
                </div>
                <span className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{post.author_name}</span>
                {post.week_posted && (
                  <span className="text-[9.5px] px-2 py-0.5 rounded-full" style={{ background: "#FFF4EE", border: "1px solid #FFCDB4", color: "#D4906A" }}>
                    Week {post.week_posted} mama
                  </span>
                )}
                <span className="text-[10px] ml-auto" style={{ color: "#D4B0A0" }}>{timeAgo(post.created_at)}</span>
              </div>
              <span className="inline-block text-[9.5px] font-semibold px-2 py-0.5 rounded-full capitalize mb-1" style={{ background: CATEGORY_COLORS[post.category] || "#FFF0E8", color: "#D4906A" }}>
                {post.category}
              </span>
              <p className="font-display text-[14px] font-bold mt-1 mb-1" style={{ color: "#2A1200", textTransform: "none" }}>{post.title}</p>
              <p className="text-[12px] line-clamp-2 leading-[1.5]" style={{ color: "#D4906A" }}>{post.body}</p>
              <div className="flex items-center gap-4 mt-2.5 pt-2" style={{ borderTop: "1px solid #FFF0E8" }}>
                <button onClick={(e) => { e.stopPropagation(); toggleLike(post); }} className="flex items-center gap-1 text-[11px]" style={{ color: "#D4B0A0" }}>
                  <Heart size={14} className={post.is_liked ? "fill-current" : ""} style={post.is_liked ? { color: "#D4906A" } : {}} /> {post.likes}
                </button>
                <span className="flex items-center gap-1 text-[11px]" style={{ color: "#D4B0A0" }}>
                  <MessageCircle size={14} /> {post.comment_count}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create post sheet */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => { setShowCreate(false); setPostError(""); }}>
          <div
            className="bg-white w-full rounded-t-[24px] flex flex-col"
            style={{ maxHeight: "85vh" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="pt-3 pb-0 flex justify-center shrink-0">
              <div className="w-10 h-[5px] rounded-full" style={{ background: "#FFCDB4" }} />
            </div>

            {/* Title */}
            <h2 className="font-display text-[20px] font-bold px-5 pt-4 pb-4 shrink-0" style={{ color: "#2A1200" }}>Create a post</h2>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="w-full rounded-[12px] p-[12px_16px] text-[15px] font-display italic outline-none mb-3"
                style={{ background: "#FFF8F5", border: "1px solid #FFE4D4", color: "#2A1200", textTransform: "none" }}
              />
              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="What's on your mind, mama?"
                rows={5}
                className="w-full rounded-[12px] p-[12px_16px] text-[13px] font-display italic outline-none resize-none mb-4"
                style={{ background: "#FFF8F5", border: "1px solid #FFE4D4", color: "#2A1200", minHeight: "140px" }}
              />
              <p className="text-[10px] uppercase mb-2" style={{ color: "#D4B0A0", letterSpacing: "0.1em" }}>Post type</p>
              <div className="flex gap-2 flex-wrap mb-2">
                {["question", "story", "tip", "support"].map(cat => (
                  <button key={cat} onClick={() => setNewCategory(cat)}
                    className="rounded-full px-4 py-[7px] text-[12px] capitalize transition-all"
                    style={{
                      background: newCategory === cat ? "#FFB899" : "#FFF0E8",
                      color: newCategory === cat ? "#2A1200" : "#D4906A",
                      fontWeight: newCategory === cat ? 600 : 500,
                      border: `1px solid ${newCategory === cat ? "#FFB899" : "#FFE4D4"}`,
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Fixed bottom submit */}
            <div className="shrink-0 px-5 py-4 bg-white" style={{ borderTop: "1px solid #FFF0E8" }}>
              <button
                onClick={createPost}
                disabled={!newTitle.trim() || posting}
                className="w-full rounded-[14px] py-[14px] text-[15px] font-display font-bold transition-all active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed"
                style={{ background: "#FFB899", color: "#2A1200", border: "none" }}
              >
                {posting ? "Posting..." : "Post to community 🌸"}
              </button>
              {postError && (
                <p className="text-[12px] text-center mt-2" style={{ color: "#D4906A" }}>{postError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
