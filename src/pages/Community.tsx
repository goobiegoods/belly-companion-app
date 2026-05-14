import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { Heart, MessageCircle, Plus, Send, Bell } from "lucide-react";
import { toast } from "sonner";
import NotificationBell, { useNotifications } from "@/components/NotificationBell";

interface Post {
  id: string; user_id: string; title: string; body: string; category: string;
  week_posted: number | null; likes: number; created_at: string;
  author_name?: string; comment_count?: number; is_liked?: boolean;
}

interface Notification {
  id: string; title: string; body: string | null; post_id: string | null;
  is_read: boolean; created_at: string;
}

const CATEGORIES = ["All", "Questions", "Stories", "Tips", "Support"];

const SEEDED_POSTS: Post[] = [
  { id: "seed-1", user_id: "", title: "Anyone else terrified of the anatomy scan?", body: "I'm 19 weeks and my anatomy scan is next week. I'm so excited but also scared they'll find something wrong. Is it normal to feel both things at once? How did you all cope with the wait?", category: "question", week_posted: 19, likes: 8, created_at: new Date(Date.now() - 86400000 * 11).toISOString(), author_name: "Maya", comment_count: 3, is_liked: false },
  { id: "seed-2", user_id: "", title: "Round ligament pain or something worse?", body: "Getting these sharp stabbing pains on my right side when I move too fast or sneeze. Doctor said round ligament pain but it freaks me out every time. Anyone have a natural remedy that actually helped?", category: "question", week_posted: 22, likes: 14, created_at: new Date(Date.now() - 86400000 * 6).toISOString(), author_name: "Priya", comment_count: 5, is_liked: false },
  { id: "seed-3", user_id: "", title: "Husband doesn't understand the exhaustion", body: "I am 9 weeks and I cannot explain to my husband why I need to be in bed by 8pm. He thinks I'm being overdramatic. Am I the only one? Please tell me this gets better in the second trimester.", category: "question", week_posted: 9, likes: 31, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), author_name: "Chloe", comment_count: 11, is_liked: false },
  { id: "seed-4", user_id: "", title: "Natural ways to turn a breech baby?", body: "My baby is still breech at 34 weeks. Midwife mentioned ECV but I want to try everything natural first. Has anyone had success with spinning babies, moxibustion, or anything else?", category: "question", week_posted: 34, likes: 19, created_at: new Date(Date.now() - 86400000 * 8).toISOString(), author_name: "Layla", comment_count: 7, is_liked: false },
  { id: "seed-5", user_id: "", title: "Nux Vomica 30c literally saved my first trimester", body: "I was vomiting 4-5 times a day until my naturopath recommended Nux Vomica 30c from Boiron. Three pellets under my tongue before bed and when I woke up. Within 3 days the nausea was 60% better.", category: "tip", week_posted: 10, likes: 47, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), author_name: "Sofia", comment_count: 8, is_liked: false },
  { id: "seed-6", user_id: "", title: "P6 acupressure point is no joke", body: "Two finger widths below your wrist between the two tendons. Press firmly for 60 seconds on each wrist. I do this every morning before getting out of bed and it genuinely takes the edge off the nausea.", category: "tip", week_posted: 8, likes: 62, created_at: new Date(Date.now() - 86400000 * 9).toISOString(), author_name: "Amara", comment_count: 12, is_liked: false },
  { id: "seed-7", user_id: "", title: "CCF tea for bloating and digestion", body: "Cumin, coriander, fennel — equal parts, steep for 10 minutes. My Ayurvedic practitioner recommended this for the gas and bloating in my second trimester.", category: "tip", week_posted: 18, likes: 28, created_at: new Date(Date.now() - 86400000 * 12).toISOString(), author_name: "Rania", comment_count: 4, is_liked: false },
  { id: "seed-8", user_id: "", title: "Magnesium glycinate for sleep is everything", body: "I was waking up 3-4 times a night from leg cramps and restlessness. My midwife suggested magnesium glycinate powder in warm water before bed.", category: "tip", week_posted: 26, likes: 55, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), author_name: "Jade", comment_count: 9, is_liked: false },
  { id: "seed-9", user_id: "", title: "I felt the first kick today and I ugly cried", body: "Week 18. I was sitting at my desk eating lunch and just — this tiny flutter. Then again. Nothing prepares you for that moment.", category: "story", week_posted: 18, likes: 89, created_at: new Date(Date.now() - 86400000 * 4).toISOString(), author_name: "Zara", comment_count: 15, is_liked: false },
  { id: "seed-10", user_id: "", title: "My home birth was everything I hoped for", body: "Week 39, my midwife arrived at 11pm. Baby was born in our bedroom at 4:17am. It was the most primal, beautiful, terrifying and empowering thing I have ever done.", category: "story", week_posted: 39, likes: 134, created_at: new Date(Date.now() - 86400000 * 7).toISOString(), author_name: "Isla", comment_count: 22, is_liked: false },
  { id: "seed-11", user_id: "", title: "NICU journey — week 28 premature birth", body: "Our son arrived at 28 weeks. We spent 72 days in the NICU. I am writing this with him asleep on my chest at home, 3.4kg and perfect.", category: "story", week_posted: 28, likes: 203, created_at: new Date(Date.now() - 86400000 * 10).toISOString(), author_name: "Nina", comment_count: 31, is_liked: false },
  { id: "seed-12", user_id: "", title: "Second pregnancy is so different and nobody told me", body: "With my first I was anxious, reading every app, tracking every symptom. This time I'm 14 weeks and just... living.", category: "story", week_posted: 14, likes: 41, created_at: new Date(Date.now() - 86400000 * 1).toISOString(), author_name: "Orel", comment_count: 6, is_liked: false },
  { id: "seed-13", user_id: "", title: "Scared to tell people because of my history", body: "I've had two losses. I'm now 8 weeks and terrified to feel hopeful. I haven't told anyone except my partner.", category: "support", week_posted: 8, likes: 76, created_at: new Date(Date.now() - 86400000 * 6).toISOString(), author_name: "Hana", comment_count: 14, is_liked: false },
  { id: "seed-14", user_id: "", title: "Prenatal anxiety is real and nobody talks about it", body: "I thought postpartum depression was the thing to worry about. Nobody warned me about the anxiety during pregnancy.", category: "support", week_posted: 22, likes: 94, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), author_name: "Leila", comment_count: 18, is_liked: false },
  { id: "seed-15", user_id: "", title: "Doing this completely alone — partner left at 6 weeks", body: "I know there are others out here. My partner left when I told him. I'm 16 weeks now and I've built the most incredible support system.", category: "support", week_posted: 16, likes: 167, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), author_name: "Ava", comment_count: 25, is_liked: false },
  { id: "seed-16", user_id: "", title: "Grieving my pre-pregnancy body and feeling ashamed of that", body: "I love this baby more than I can say. And I also miss feeling like myself in my body.", category: "support", week_posted: 20, likes: 88, created_at: new Date(Date.now() - 86400000 * 8).toISOString(), author_name: "Mia", comment_count: 13, is_liked: false },
];

const CATEGORY_PILL_COLORS: Record<string, string> = {
  question: "rgba(255,255,255,0.20)",
  tip: "rgba(200,255,220,0.20)",
  story: "rgba(220,200,255,0.20)",
  support: "rgba(255,255,200,0.20)",
};

const titleCase = (s: string) => s?.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(' ') || '';

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
              {!n.is_read && <div className="w-[3px] rounded-full self-stretch shrink-0" style={{ background: "white" }} />}
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
  const renderPostCard = (post: Post, isPinned: boolean) => (
    <button key={post.id} onClick={() => openPost(post)}
      className="w-full text-left belly-card-interactive"
      style={{
        background: isPinned ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.16)",
        border: isPinned ? "1px solid rgba(255,255,255,0.34)" : "1px solid rgba(255,255,255,0.24)",
        borderRadius: 18,
        backdropFilter: "blur(14px)",
        padding: "13px 14px",
        position: "relative",
      }}>
      {isPinned && (
        <span style={{
          position: "absolute", top: 10, right: 10,
          background: "var(--color-bg-card)",
          borderRadius: 6, padding: "2px 7px",
          fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 8,
          color: "var(--color-accent-dark)", textTransform: "uppercase", letterSpacing: "0.05em",
        }}>PINNED</span>
      )}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--color-bg-card)", color: "var(--color-accent-dark)", fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 12 }}>
          {initials(post.author_name || "")}
        </div>
        <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 700, color: "var(--color-accent-dark)" }}>{titleCase(post.author_name || "")}</span>
        {post.week_posted && (
          <span style={{
            background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)",
            borderRadius: 7, padding: "2px 6px",
            fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 9, color: "var(--color-accent-dark)",
          }}>
            Week {post.week_posted}
          </span>
        )}
        <span className="ml-auto" style={{ color: "var(--color-text-secondary)", fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 10 }}>{timeAgo(post.created_at)}</span>
      </div>
      <span className="inline-block capitalize mb-1" style={{
        background: CATEGORY_PILL_COLORS[post.category] || "rgba(255,255,255,0.20)",
        borderRadius: 8, padding: "2px 8px",
        fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 9, color: "var(--color-accent-dark)",
        border: "none",
      }}>
        {post.category}
      </span>
      <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 15, fontWeight: 700, color: "var(--color-accent-dark)", marginTop: 4, marginBottom: 4, lineHeight: "1.25" }}>{post.title}</p>
      <p className="line-clamp-2" style={{ color: "var(--color-text-primary)", fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 11, lineHeight: "1.5" }}>{post.body}</p>
      <div className="flex items-center gap-[10px]" style={{ borderTop: "1px solid var(--color-border-default)", paddingTop: 8, marginTop: 8 }}>
        <button onClick={(e) => { e.stopPropagation(); toggleLike(post); }}
          className={`flex items-center gap-1 text-[11px] ${likeAnimating === post.id ? "heart-liked" : ""}`}
          style={{ color: post.is_liked ? "white" : "rgba(255,255,255,0.45)" }}>
          <Heart size={14} className={post.is_liked ? "fill-current" : ""} /> {post.likes}
        </button>
        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
          <MessageCircle size={14} /> {post.comment_count}
        </span>
      </div>
    </button>
  );

  // --- FEED ---
  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 32, color: "var(--color-accent-dark)", display: "block", lineHeight: "1.0" }}>Mama</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontStyle: "italic", fontSize: 38, color: "var(--color-accent-dark)", letterSpacing: -1, display: "block", lineHeight: "1.0", marginBottom: 5 }}>community</span>
          <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 11, color: "var(--color-text-secondary)" }}>
            {currentWeek ? `Week ${currentWeek} mamas` : "Mamas"} · {posts.length} members
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <NotificationBell onOpenNotifications={() => setShowNotifications(true)} unreadCount={unreadCount} />
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 belly-btn-primary"
            style={{
              background: "white", color: "var(--color-accent-primary)",
              fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 13,
              borderRadius: 20, padding: "7px 16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: "none",
            }}>
            <Plus size={14} /> Post
          </button>
        </div>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto hide-scrollbar">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="whitespace-nowrap transition-all belly-btn-press"
            style={{
              background: activeCategory === cat ? "white" : "rgba(255,255,255,0.16)",
              color: activeCategory === cat ? "#FF6520" : "rgba(255,255,255,0.80)",
              fontWeight: activeCategory === cat ? 700 : 500,
              fontSize: activeCategory === cat ? 12 : 11,
              fontFamily: "'Outfit', system-ui",
              border: activeCategory === cat ? "none" : "1px solid rgba(255,255,255,0.24)",
              borderRadius: 20,
              padding: activeCategory === cat ? "5px 14px" : "5px 12px",
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

      {/* Create post sheet */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-end" onClick={() => { setShowCreate(false); setPostError(""); }}>
          <div className="w-full rounded-t-[24px] flex flex-col max-h-[90vh] overflow-hidden sheet-enter"
            style={{ background: "var(--color-bg-base)" }}
            onClick={e => e.stopPropagation()}>
            <div className="pt-3 pb-0 flex justify-center shrink-0">
              <div className="w-10 h-[5px] rounded-full" style={{ background: "var(--color-bg-card)" }} />
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--color-accent-dark)", padding: "16px 20px 16px" }}>Create a post</h2>
            <div className="flex-1 overflow-y-auto min-h-0 px-5" style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Give your post a title..."
                className="w-full rounded-[14px] p-[12px_16px] text-[15px] outline-none mb-3"
                style={{ background: "#fff", color: "var(--color-text-primary)", fontFamily: "'Outfit', system-ui", fontStyle: "italic", border: "none" }} />
              <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="What's on your mind, mama?" rows={5}
                className="w-full rounded-[14px] p-[12px_16px] text-[13px] outline-none resize-none mb-4"
                style={{ background: "#fff", color: "var(--color-text-primary)", fontFamily: "'Outfit', system-ui", fontStyle: "italic", border: "none", minHeight: "140px" }} />
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--color-text-primary)", fontWeight: 600 }}>Post type</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {["question", "story", "tip", "support"].map(cat => (
                  <button key={cat} onClick={() => setNewCategory(cat)}
                    className="rounded-full px-4 py-[7px] text-[12px] capitalize transition-all belly-btn-press"
                    style={{
                      background: newCategory === cat ? "white" : "rgba(255,255,255,0.18)",
                      color: newCategory === cat ? "#FF6520" : "#fff",
                      fontWeight: newCategory === cat ? 700 : 500,
                      fontFamily: "'Outfit', system-ui",
                      border: newCategory === cat ? "none" : "1px solid rgba(255,255,255,0.22)",
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={createPost} disabled={!newTitle.trim() || !newBody.trim() || posting}
                className="w-full rounded-[14px] py-[14px] text-[16px] font-semibold transition-all"
                style={{
                  background: "white",
                  color: "var(--color-accent-primary)",
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  border: "none",
                  opacity: (!newTitle.trim() || !newBody.trim() || posting) ? 0.4 : 1,
                  pointerEvents: (!newTitle.trim() || !newBody.trim() || posting) ? "none" : "auto",
                }}>
                {posting ? "Posting..." : "Post it →"}
              </button>
              {postError && <p className="text-[12px] text-center mt-2" style={{ color: "#FFB899" }}>{postError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
