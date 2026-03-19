import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { Heart, MessageCircle, Plus } from "lucide-react";
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

const CATEGORIES = ["All", "Questions", "Stories", "Tips", "Support"];

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

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;

  const fetchPosts = async () => {
    let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (activeCategory !== "All") {
      query = query.eq("category", activeCategory.toLowerCase().slice(0, -1));
    }
    const { data } = await query;
    // Fetch author names from profiles
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, first_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profiles?.forEach(p => { nameMap[p.user_id] = p.first_name || "Mama"; });

      // Fetch comment counts
      const postIds = data.map(p => p.id);
      const { data: commentData } = await supabase.from("comments").select("post_id").in("post_id", postIds);
      const countMap: Record<string, number> = {};
      commentData?.forEach(c => { countMap[c.post_id] = (countMap[c.post_id] || 0) + 1; });

      // Fetch likes
      let likeMap: Record<string, boolean> = {};
      if (user) {
        const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds);
        likes?.forEach(l => { likeMap[l.post_id] = true; });
      }

      setPosts(data.map(p => ({
        ...p,
        author_name: nameMap[p.user_id] || "Mama",
        comment_count: countMap[p.id] || 0,
        is_liked: !!likeMap[p.id],
      })));
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [activeCategory]);

  const createPost = async () => {
    if (!newTitle.trim() || !newBody.trim() || !user) return;
    await supabase.from("posts").insert({
      user_id: user.id,
      title: newTitle,
      body: newBody,
      category: newCategory,
      week_posted: currentWeek,
    });
    setShowCreate(false);
    setNewTitle("");
    setNewBody("");
    toast.success("Posted! 🌸");
    fetchPosts();
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
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
    const { data } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, first_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profiles?.forEach(p => { nameMap[p.user_id] = p.first_name || "Mama"; });
      setComments(data.map(c => ({ ...c, author_name: nameMap[c.user_id] || "Mama" })));
    } else {
      setComments(data || []);
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !user || !selectedPost) return;
    await supabase.from("comments").insert({ post_id: selectedPost.id, user_id: user.id, body: commentText });
    setCommentText("");
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

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-belly-bg pb-20">
        <div className="px-5 pt-5 pb-3 bg-card border-b border-belly-card-border flex items-center gap-3">
          <button onClick={() => setSelectedPost(null)} className="text-belly-accent text-sm">← Back</button>
          <h1 className="font-display text-[16px] font-bold text-foreground">Post</h1>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-belly-icon-bg flex items-center justify-center text-belly-accent text-xs font-semibold">{initials(selectedPost.author_name || "")}</div>
            <span className="text-[13px] font-semibold text-foreground">{selectedPost.author_name}</span>
            {selectedPost.week_posted && <span className="text-[10px] bg-belly-upsell-bg text-belly-accent px-2 py-0.5 rounded-pill">Week {selectedPost.week_posted}</span>}
            <span className="text-[10px] text-belly-text-hint ml-auto">{timeAgo(selectedPost.created_at)}</span>
          </div>
          <h2 className="font-display text-[16px] font-bold text-foreground mb-2">{selectedPost.title}</h2>
          <p className="text-[13px] text-foreground leading-relaxed mb-4">{selectedPost.body}</p>
          <div className="border-t border-belly-divider pt-4 space-y-3">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-belly-icon-bg flex items-center justify-center text-belly-accent text-[10px] font-semibold shrink-0">{initials(c.author_name)}</div>
                <div>
                  <p className="text-[11px] text-belly-text-muted">{c.author_name} · {timeAgo(c.created_at)}</p>
                  <p className="text-[13px] text-foreground">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-card border-t border-belly-card-border flex gap-2">
          <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 h-10 rounded-input border border-belly-card-border bg-background px-4 text-sm belly-input-focus placeholder:text-belly-text-hint" />
          <button onClick={addComment} disabled={!commentText.trim()} className="h-10 px-4 rounded-input bg-primary text-primary-foreground text-sm font-semibold belly-btn-press disabled:opacity-40">Post</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-belly-bg pb-20">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-foreground">Community</h1>
          <p className="text-[11px] text-belly-text-muted">You're not alone in this</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground rounded-pill px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1 belly-btn-press">
          <Plus size={14} /> Post
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto hide-scrollbar">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`rounded-pill px-3 py-1.5 text-[11px] font-medium whitespace-nowrap belly-btn-press ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-belly-icon-bg text-belly-accent"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="px-5 space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="bg-card border border-belly-card-border rounded-card p-4 animate-pulse h-28" />)
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-belly-icon-bg mx-auto mb-3 flex items-center justify-center"><span className="text-2xl">💕</span></div>
            <p className="font-display text-[16px] font-bold text-foreground mb-1">Be the first to share your story</p>
            <p className="text-[11px] text-belly-text-muted">Start a conversation with other mamas</p>
          </div>
        ) : (
          posts.map(post => (
            <button key={post.id} onClick={() => openPost(post)} className="w-full bg-card border border-belly-card-border rounded-card p-4 text-left belly-press">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-belly-icon-bg flex items-center justify-center text-belly-accent text-xs font-semibold">{initials(post.author_name || "")}</div>
                <span className="text-[13px] font-semibold text-foreground">{post.author_name}</span>
                {post.week_posted && <span className="text-[10px] bg-belly-upsell-bg text-belly-accent px-2 py-0.5 rounded-pill">Week {post.week_posted}</span>}
                <span className="text-[10px] text-belly-text-hint ml-auto">{timeAgo(post.created_at)}</span>
              </div>
              <span className="text-[9px] bg-belly-icon-bg text-belly-accent px-2 py-0.5 rounded-pill capitalize mb-1 inline-block">{post.category}</span>
              <p className="font-display text-[14px] font-bold text-foreground">{post.title}</p>
              <p className="text-[12px] text-belly-text-muted line-clamp-2 mt-1">{post.body}</p>
              <div className="flex items-center gap-4 mt-3">
                <button onClick={(e) => { e.stopPropagation(); toggleLike(post); }} className="flex items-center gap-1 text-[11px] text-belly-text-muted">
                  <Heart size={14} className={post.is_liked ? "fill-belly-accent text-belly-accent" : ""} /> {post.likes}
                </button>
                <span className="flex items-center gap-1 text-[11px] text-belly-text-muted">
                  <MessageCircle size={14} /> {post.comment_count}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create post sheet */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-card w-full rounded-t-sheet p-5 space-y-4 animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 rounded-full bg-belly-card-border mx-auto" />
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What's on your mind?" className="w-full font-display text-[16px] font-bold placeholder:text-belly-text-hint border-none outline-none bg-transparent" />
            <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Share more details..." rows={4} className="w-full text-sm placeholder:text-belly-text-hint border border-belly-card-border rounded-input p-3 belly-input-focus resize-none bg-transparent" />
            <div className="flex gap-2">
              {["question", "story", "tip", "support"].map(cat => (
                <button key={cat} onClick={() => setNewCategory(cat)} className={`rounded-pill px-3 py-1.5 text-[11px] capitalize belly-btn-press ${newCategory === cat ? "bg-primary text-primary-foreground" : "bg-belly-icon-bg text-belly-accent"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 h-11 rounded-input border border-belly-card-border text-sm text-belly-text-muted belly-btn-press">Cancel</button>
              <button onClick={createPost} disabled={!newTitle.trim() || !newBody.trim()} className="flex-1 h-11 rounded-input bg-primary text-primary-foreground text-sm font-semibold belly-btn-press disabled:opacity-40">Post to community</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
