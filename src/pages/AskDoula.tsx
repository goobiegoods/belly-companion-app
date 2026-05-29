import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, pregnancyWeeks } from "@/data/pregnancyWeeks";
import { Send, Square, Camera, X, ChevronLeft, Loader2 } from "lucide-react";
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
  const safetyScanRef = useRef(false);
  const safetyCameraInputRef = useRef<HTMLInputElement>(null);

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
    if (!user?.id) return;
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("chat_messages")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("role", "user")
      .gte("created_at", today + "T00:00:00Z")
      .then(({ count }) => setMessageCount(count || 0));
  }, [user?.id]);

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
    const wasSafetyScan = safetyScanRef.current;
    safetyScanRef.current = false;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const img = { base64, url: result };
      setAttachedImage(img);
      if (wasSafetyScan) {
        const prompt = `Is this product safe for me at week ${currentWeek}?`;
        setTimeout(() => sendMessageWithImage(prompt, img), 50);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSafetyChipClick = () => {
    safetyScanRef.current = true;
    safetyCameraInputRef.current?.click();
  };

  const sendMessageWithImage = (text: string, img: { base64: string; url: string }) =>
    sendMessage(text, img);

  const sendMessage = async (text: string, imageOverride?: { base64: string; url: string }) => {
    const activeImage = imageOverride || attachedImage;
    if ((!text.trim() && !activeImage) || isStreaming) return;
    if (!profile?.is_premium && messageCount >= 10) {
      toast.error("You've reached your daily limit. Upgrade to Premium for unlimited messages.");
      return;
    }

    const hasImage = !!activeImage;
    const imageUrl = activeImage?.url;
    let apiContent: any = text.trim() || (hasImage ? "Is this product safe to use during pregnancy?" : "");
    if (hasImage) {
      apiContent = [
        { type: "image_url", image_url: { url: activeImage!.url } },
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
        body: JSON.stringify({
          messages: apiMessages,
          userContext: {
            userName: displayName,
            currentWeek,
            pregnancyNumber: profile?.pregnancy_number ?? 1,
            todaysMood: null,
            recentSymptoms: null,
          },
        }),
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
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-sage-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-start", marginTop: 4, fontSize: 14 }}>
        🌸
      </div>
      <div className="mr-auto" style={{ maxWidth: "85%" }}>
        <div className="px-4 py-3 text-[14px] leading-[1.65]"
          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderLeft: "3px solid var(--color-sage)", color: "var(--color-text-primary)", borderRadius: 18, fontFamily: "'Outfit', system-ui" }}>
          {imageUrl && (
            <img src={imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
          )}
          <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-0 [&>ul]:list-none [&>ul>li]:mb-1.5 [&>ul>li]:pl-0 [&>h3]:text-[12px] [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>h3]:text-[var(--color-accent-dark)] [&>h2]:text-[13px] [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>h2]:text-[var(--color-accent-dark)] [&>strong]:font-semibold [&>strong]:text-[var(--color-accent-dark)] [&>em]:text-[var(--color-accent-primary)]" style={{ color: "var(--color-text-primary)" }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        {timestamp && (
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 300, fontSize: 10, color: "var(--color-text-muted)", marginTop: 6, paddingLeft: 4 }}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <style>{`
        @keyframes livePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-7px); } }
        .doula-input::placeholder { color: #bbb !important; font-style: normal !important; }
        .chip-row::-webkit-scrollbar { display: none; }
      `}</style>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
      <input ref={safetyCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

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
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-default)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <ChevronLeft size={18} color="var(--color-accent-primary)" />
            </button>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 800, color: "var(--color-accent-dark)" }}>Ask <span style={{ color: "var(--color-accent-primary)", fontStyle: "italic" }}>Bella</span></h1>
          </div>
          <div style={{ position: "relative", width: 28, height: 28, marginTop: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌸</div>
            <span style={{ position: "absolute", bottom: -1, right: -1, width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "livePulse 2s infinite", boxShadow: "0 0 0 2px var(--color-bg-base)" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginLeft: 44, marginTop: 4 }}>
          <span className="pill-base pill-sage" style={{ fontSize: 10, padding: "3px 10px" }}>Knows your history</span>
          <span className="pill-base pill-sage" style={{ fontSize: 10, padding: "3px 10px" }}>Week {currentWeek}</span>
          <span className="pill-base pill-sage" style={{ fontSize: 10, padding: "3px 10px" }}>{(profile?.pregnancy_number ?? 1) === 1 ? "1st" : (profile?.pregnancy_number ?? 1) === 2 ? "2nd" : `${profile?.pregnancy_number}th`} pregnancy</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 16, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && renderAssistantBubble(greetingText, undefined, "Just now")}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "assistant" ? (
              renderAssistantBubble(getTextContent(msg.content), msg.imageUrl)
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "78%" }}>
                  <div className="px-[14px] py-3 text-[14px] leading-[1.55]"
                    style={{ background: "var(--color-accent-light)", color: "var(--color-text-primary)", borderRadius: 18, fontFamily: "'Outfit', system-ui", fontWeight: 500 }}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
                    )}
                    {getTextContent(msg.content)}
                  </div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-light)", color: "var(--color-accent-dark)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4, fontSize: 13, fontFamily: "'Outfit',system-ui", fontWeight: 700 }}>
                  {(displayName?.[0] || "B").toUpperCase()}
                </div>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-start", marginTop: 4, fontSize: 14 }}>🌸</div>
            <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderRadius: "12px 12px 12px 3px", padding: "10px 14px", display: "inline-flex", gap: 5, alignItems: "center", alignSelf: "flex-start" }}>
              {[0, 0.15, 0.3].map(d => (
                <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-primary)", animation: `typingBounce 1.2s infinite ${d}s`, display: "inline-block" }} />
              ))}
            </div>
          </div>
        )}

        {/* Inline upsell when quota exhausted */}
        {quotaExhausted && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-start", marginTop: 4, fontSize: 14 }}>🌸</div>
            <div style={{ maxWidth: "85%" }}>
              <div className="px-4 py-3"
                style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderRadius: "16px 16px 16px 4px", fontFamily: "'Outfit', system-ui" }}>
                <p style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: 10 }}>
                  You've used your 10 free messages for today 🌸 Upgrade to Premium for unlimited access.
                </p>
                <button onClick={() => setShowPremium(true)}
                  style={{ background: "var(--color-accent-primary)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
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
          <button
            onClick={handleSafetyChipClick}
            style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderRadius: 20, padding: "8px 16px", fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 12, color: "var(--color-accent-dark)", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}>
            📸 Is this safe to use?
          </button>
          {QUICK_PROMPTS.map(prompt => (
            <button key={prompt} onClick={() => sendMessage(prompt)}
              style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderRadius: 20, padding: "8px 16px", fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 12, color: "var(--color-accent-dark)", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer" }}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {showPhotoMenu && (
        <div className="px-4 py-2 flex gap-2" style={{ background: "var(--color-bg-card)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--color-border-default)" }}>
          <button onClick={() => { cameraInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "var(--color-bg-base)", color: "var(--color-accent-dark)", fontFamily: "'Outfit', system-ui" }}>
            📸 Take a photo
          </button>
          <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "var(--color-bg-base)", color: "var(--color-accent-dark)", fontFamily: "'Outfit', system-ui" }}>
            🖼️ Choose from library
          </button>
        </div>
      )}

      {attachedImage && (
        <div className="px-4 py-2" style={{ background: "var(--color-bg-card)", borderTop: "1px solid var(--color-border-default)" }}>
          <div className="relative inline-block">
            <img src={attachedImage.url} alt="Preview" className="w-[60px] h-[60px] rounded-[10px] object-cover" style={{ border: "1px solid var(--color-border-default)" }} />
            <button onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)" }}>
              <X size={10} style={{ color: "var(--color-text-primary)" }} />
            </button>
          </div>
        </div>
      )}

      {/* Sticky pill input bar */}
      <div style={{ position: "sticky", bottom: 0, zIndex: 10, background: "var(--color-bg-base)", padding: "12px 16px 14px", borderTop: "2px solid var(--color-accent-primary)", boxShadow: "0 -8px 24px -12px rgba(255, 140, 66, 0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "0 auto 8px" }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-accent-primary)", opacity: 0.7 }} />
          <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: "var(--color-accent-primary)", textTransform: "uppercase" }}>Ask Bella anything</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-accent-primary)", opacity: 0.7 }} />
        </div>
        <div className="flex items-center" style={{ background: "var(--color-bg-card)", border: "1.5px solid rgba(255, 140, 66, 0.35)", borderRadius: 28, padding: "5px 5px 5px 16px", gap: 8, boxShadow: "0 6px 20px -6px rgba(255, 140, 66, 0.22), 0 2px 6px rgba(40, 20, 5, 0.06)" }}>
          {(() => {
            const lastMsg = messages[messages.length - 1];
            const showSpinner = isStreaming && (!!lastMsg?.imageUrl || (messages[messages.length - 2]?.imageUrl && lastMsg?.role === "assistant"));
            return (
              <button onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                disabled={isStreaming}
                className="shrink-0 flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-bg-base)", border: "none" }}>
                {showSpinner
                  ? <Loader2 size={15} className="animate-spin" style={{ color: "var(--color-accent-primary)" }} />
                  : <Camera size={15} style={{ color: "var(--color-accent-primary)" }} />}
              </button>
            );
          })()}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask anything..."
            disabled={quotaExhausted}
            className="flex-1 outline-none bg-transparent doula-input"
            style={{ color: "var(--color-text-primary)", fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 14.5, border: "none" }}
          />

          {isStreaming ? (
            <button onClick={cancelStream} className="shrink-0 flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-bg-base)", border: "1px solid var(--color-border-default)" }}>
              <Square size={16} style={{ color: "var(--color-accent-dark)" }} />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)}
              disabled={(!input.trim() && !attachedImage) || quotaExhausted}
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--color-accent-primary)", border: "none",
                boxShadow: "var(--shadow-warm)",
                opacity: ((!input.trim() && !attachedImage) || quotaExhausted) ? 0.5 : 1,
                cursor: ((!input.trim() && !attachedImage) || quotaExhausted) ? "not-allowed" : "pointer",
              }}>
              <Send size={16} style={{ color: "#fff" }} />
            </button>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 8, fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 10, color: "var(--color-text-muted)" }}>
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
