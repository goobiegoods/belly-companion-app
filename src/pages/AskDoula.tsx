import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, pregnancyWeeks } from "@/data/pregnancyWeeks";
import { Send, Square, Camera, X, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { PremiumModal } from "@/components/PremiumModal";

interface Message {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; source?: any }>;
  imageUrl?: string;
}

const AskDoula = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; url: string } | null>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  pregnancyWeeks.find(w => w.week === currentWeek); // keep import side-effect parity
  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const displayName = titleCase(profile?.first_name || "") || "mama";

  const weekMilestone =
    currentWeek === 20 ? "you're halfway there!"
    : currentWeek <= 12 ? "first trimester, the early days"
    : currentWeek <= 26 ? "you're in the second trimester"
    : "in the home stretch now";

  const QUICK_PROMPTS = [
    `What's normal at week ${currentWeek}?`,
    "Help me sleep tonight",
    "What should I avoid?",
    "I'm feeling anxious",
  ];

  const quotaExhausted = !profile?.is_premium && messageCount >= 10;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("chat_messages")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("role", "user")
      .gte("created_at", today + "T00:00:00Z")
      .then(({ count }) => setMessageCount(count || 0));
  }, [user]);

  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (prefill && typeof prefill === "string") {
      setInput(prefill);
      window.history.replaceState({}, document.title);
      setTimeout(() => { sendMessage(prefill); }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowPhotoMenu(false);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setAttachedImage({ base64, url: result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && !attachedImage) || isStreaming) return;
    if (!profile?.is_premium && messageCount >= 10) {
      toast.error("You've reached your daily limit. Upgrade to Premium for unlimited messages.");
      return;
    }

    const hasImage = !!attachedImage;
    const imageUrl = attachedImage?.url;
    let apiContent: any = text.trim() || (hasImage ? "Is this product safe to use during pregnancy?" : "");
    if (hasImage) {
      apiContent = [
        { type: "image_url", image_url: { url: attachedImage!.url } },
        { type: "text", text: text.trim() || "Is this product safe to use during pregnancy?" },
      ];
    }

    const userMsg: Message = {
      role: "user",
      content: typeof apiContent === "string" ? apiContent : text.trim() || "Is this product safe to use during pregnancy?",
      imageUrl: hasImage ? imageUrl : undefined,
    };
    const apiMsg = { role: "user" as const, content: apiContent };
    const newMessages = [...messages, userMsg];
    const apiMessages = [
      ...messages.map(m => ({ role: m.role, content: typeof m.content === "string" ? m.content : m.content })),
      apiMsg,
    ];

    setMessages(newMessages);
    setInput("");
    setAttachedImage(null);
    setIsStreaming(true);
    setMessageCount(c => c + 1);

    if (user) {
      await supabase.from("chat_messages").insert({
        user_id: user.id, role: "user",
        content: typeof userMsg.content === "string" ? userMsg.content : JSON.stringify(userMsg.content),
      });
    }

    const abortController = new AbortController();
    abortRef.current = abortController;
    let assistantContent = "";

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/belly-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Too many requests. Please wait a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Please try again later.");
        else toast.error("Something went wrong. Please try again.");
        setIsStreaming(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ") || line.trim() === "" || line.startsWith(":")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (user && assistantContent) {
        await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistantContent });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") toast.error("Connection failed. Please try again.");
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const cancelStream = () => { abortRef.current?.abort(); };

  const getTextContent = (content: Message["content"]) => {
    if (typeof content === "string") return content;
    return content.find(c => c.type === "text")?.text || "";
  };

  const greetingText = `Hi ${displayName}! 🌸 You're at week ${currentWeek} — ${weekMilestone}. I'm here for you 24/7. What's on your mind today?`;

  const renderAssistantBubble = (content: string, imageUrl?: string, timestamp?: string) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}>
        <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 9, color: "#fff" }}>D</span>
      </div>
      <div className="mr-auto" style={{ maxWidth: "85%" }}>
        <div className="px-4 py-3 text-[14px] leading-[1.65]"
          style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", borderRadius: "16px 16px 16px 4px", fontFamily: "'Outfit', system-ui" }}>
          {imageUrl && (
            <img src={imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
          )}
          <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-0 [&>ul]:list-none [&>ul>li]:mb-1.5 [&>ul>li]:pl-0 [&>h3]:text-[12px] [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>h2]:text-[13px] [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>strong]:font-semibold" style={{ color: "#fff" }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        {timestamp && (
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 300, fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, paddingLeft: 4 }}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#FF8C42" }}>
      <style>{`
        @keyframes livePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-7px); } }
        .doula-input::placeholder { color: #bbb !important; font-style: normal !important; }
        .chip-row::-webkit-scrollbar { display: none; }
      `}</style>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Minimal header */}
      <div style={{ padding: "16px 20px 12px", flexShrink: 0 }}>
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center" style={{ gap: 12 }}>
            <button
              onClick={handleBack}
              aria-label="Go back"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <ChevronLeft size={18} color="#fff" />
            </button>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 800, color: "white" }}>Ask the Doula</h1>
          </div>
          <span style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "livePulse 2s infinite" }} />
            <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 9, letterSpacing: 1, color: "#fff" }}>AI · LIVE</span>
          </span>
        </div>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.55)", marginLeft: 44 }}>
          Your natural pregnancy guide
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 16, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && renderAssistantBubble(greetingText, undefined, "Just now")}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "assistant" ? (
              renderAssistantBubble(getTextContent(msg.content), msg.imageUrl)
            ) : (
              <div className="ml-auto" style={{ maxWidth: "80%" }}>
                <div className="px-[14px] py-3 text-[14px] leading-[1.55]"
                  style={{ background: "#fff", color: "#333", borderRadius: "16px 16px 4px 16px", fontFamily: "'Outfit', system-ui", fontWeight: 500 }}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
                  )}
                  {getTextContent(msg.content)}
                </div>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}>
              <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 9, color: "#fff" }}>D</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: "12px 12px 12px 3px", padding: "10px 14px", display: "inline-flex", gap: 5, alignItems: "center", alignSelf: "flex-start" }}>
              {[0, 0.15, 0.3].map(d => (
                <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)", animation: `typingBounce 1.2s infinite ${d}s`, display: "inline-block" }} />
              ))}
            </div>
          </div>
        )}

        {/* Inline upsell when quota exhausted */}
        {quotaExhausted && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}>
              <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 9, color: "#fff" }}>D</span>
            </div>
            <div style={{ maxWidth: "85%" }}>
              <div className="px-4 py-3"
                style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: "16px 16px 16px 4px", fontFamily: "'Outfit', system-ui" }}>
                <p style={{ fontSize: 14, color: "#fff", lineHeight: 1.65, marginBottom: 10 }}>
                  You've used your 10 free messages for today 🌸 Upgrade to Premium for unlimited access.
                </p>
                <button onClick={() => setShowPremium(true)}
                  style={{ background: "#fff", color: "#FF8C42", border: "none", borderRadius: 20, padding: "8px 18px", fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Go Premium →
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips — only when no conversation yet */}
      {messages.length === 0 && (
        <div className="chip-row" style={{ display: "flex", flexDirection: "row", gap: 8, overflowX: "auto", padding: "8px 16px", flexShrink: 0, scrollbarWidth: "none" }}>
          {QUICK_PROMPTS.map(prompt => (
            <button key={prompt} onClick={() => sendMessage(prompt)}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 20, padding: "8px 16px", fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 12, color: "#fff", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer" }}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {showPhotoMenu && (
        <div className="px-4 py-2 flex gap-2" style={{ background: "rgba(200,80,10,0.40)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <button onClick={() => { cameraInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "#FF8C42", color: "white", fontFamily: "'Outfit', system-ui" }}>
            📸 Take a photo
          </button>
          <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "#FF8C42", color: "white", fontFamily: "'Outfit', system-ui" }}>
            🖼️ Choose from library
          </button>
        </div>
      )}

      {attachedImage && (
        <div className="px-4 py-2" style={{ background: "rgba(200,80,10,0.40)", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="relative inline-block">
            <img src={attachedImage.url} alt="Preview" className="w-[60px] h-[60px] rounded-[10px] object-cover" style={{ border: "1px solid rgba(255,255,255,0.22)" }} />
            <button onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <X size={10} style={{ color: "#3A1A00" }} />
            </button>
          </div>
        </div>
      )}

      {/* Sticky input bar */}
      <div style={{ position: "sticky", bottom: 0, zIndex: 10, background: "rgba(220,90,10,0.97)", backdropFilter: "blur(16px)", padding: "10px 16px 14px" }}>
        <div className="flex items-center" style={{ background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: "4px 4px 4px 16px", gap: 8 }}>
          <button onClick={() => setShowPhotoMenu(!showPhotoMenu)}
            className="shrink-0 flex items-center justify-center"
            style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,120,64,0.12)" }}>
            <Camera size={14} style={{ color: "#FF6520" }} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask anything..."
            disabled={quotaExhausted}
            className="flex-1 outline-none bg-transparent doula-input"
            style={{ color: "#333", fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 14, border: "none" }}
          />
          {isStreaming ? (
            <button onClick={cancelStream} className="shrink-0 flex items-center justify-center"
              style={{ width: 38, height: 38, borderRadius: "50%", background: "#FF8C42" }}>
              <Square size={16} style={{ color: "white" }} />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)}
              disabled={(!input.trim() && !attachedImage) || quotaExhausted}
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: quotaExhausted ? "rgba(255,255,255,0.3)" : "#FF8C42",
                opacity: ((!input.trim() && !attachedImage) || quotaExhausted) ? 0.5 : 1,
                cursor: ((!input.trim() && !attachedImage) || quotaExhausted) ? "not-allowed" : "pointer",
              }}>
              <Send size={16} style={{ color: "white" }} />
            </button>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 8, fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 10, color: profile?.is_premium ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)" }}>
          {profile?.is_premium
            ? "Unlimited messages ✨"
            : quotaExhausted
              ? "You've used your 10 free messages for today"
              : `${messageCount}/10 free messages today`}
        </p>
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
};

export default AskDoula;
