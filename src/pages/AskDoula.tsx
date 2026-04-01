import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, pregnancyWeeks } from "@/data/pregnancyWeeks";
import { Send, Square, Camera, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; source?: any }>;
  imageUrl?: string;
}

const AskDoula = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; url: string } | null>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekData = pregnancyWeeks.find(w => w.week === currentWeek) || pregnancyWeeks[19];
  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const displayName = titleCase(profile?.first_name || "") || "mama";

  const topSymptom = weekData.momSymptoms[0] || "fatigue";
  const topRemedy = weekData.naturalTip.includes("ginger") ? "Nux Vomica 30c" : weekData.naturalTip.includes("magnesium") ? "Kali Phos 6x" : weekData.naturalTip.includes("raspberry") ? "Caulophyllum 30c" : "Arnica Montana 30c";
  const fruitName = weekData.babySize.split(" ")[0];

  const QUICK_PROMPTS = [
    `What's normal in week ${currentWeek}?`,
    `Natural remedy for ${topSymptom.toLowerCase()}`,
    "Help me sleep tonight",
    "What should I avoid now?",
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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

  const sendMessage = async (text: string, triggerPhoto = false) => {
    if (triggerPhoto) { fileInputRef.current?.click(); return; }
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
        { type: "image_url", image_url: { url: attachedImage.url } },
        { type: "text", text: text.trim() || "Is this product safe to use during pregnancy?" },
      ];
    }

    const userMsg: Message = { role: "user", content: typeof apiContent === "string" ? apiContent : text.trim() || "Is this product safe to use during pregnancy?", imageUrl: hasImage ? imageUrl : undefined };
    const apiMsg = { role: "user" as const, content: apiContent };
    const newMessages = [...messages, userMsg];
    const apiMessages = [...messages.map(m => ({ role: m.role, content: typeof m.content === "string" ? m.content : m.content })), apiMsg];

    setMessages(newMessages);
    setInput("");
    setAttachedImage(null);
    setIsStreaming(true);
    setMessageCount(c => c + 1);

    if (user) {
      await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: typeof userMsg.content === "string" ? userMsg.content : JSON.stringify(userMsg.content) });
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

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstAssistantIdx = messages.findIndex(m => m.role === "assistant");

  return (
    <div className="flex flex-col h-screen page-enter" style={{ background: "transparent" }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0" style={{ background: "rgba(255,140,66,0.60)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
        <div className="flex items-center gap-2 mb-0.5">
          <button onClick={() => navigate("/")} className="mr-1" style={{ color: "white", fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600 }}>← Home</button>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "white" }}>Ask the Doula</h1>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", color: "white" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
            AI · LIVE
          </span>
        </div>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.55)" }}>Your natural pregnancy guide</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <>
            {/* Welcome hero */}
            <div className="rounded-[22px] p-[18px_16px] mt-2 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.40)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div className="absolute rounded-full" style={{ right: -10, top: -10, width: 80, height: 80, background: "rgba(255,255,255,0.08)" }} />
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.22)", fontSize: 18 }}>🌸</div>
                <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white" }}>Ask the Doula</span>
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 8, background: "rgba(255,255,255,0.2)", border: "0.5px solid rgba(255,255,255,0.3)", color: "white" }}>AI</span>
              </div>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 22, fontWeight: 600, color: "white" }}>Your</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 800, fontStyle: "italic", color: "white", marginBottom: 4, letterSpacing: "-0.5px" }}>doula chat</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.58)", lineHeight: 1.55, fontStyle: "italic" }}>
                You're in week {currentWeek}. Ask me anything — remedies, symptoms, what to expect, or just talk.
              </p>
            </div>

            {/* Week context strip */}
            <div className="flex gap-2 mt-3">
              {[
                { emoji: "🥑", title: `Week ${currentWeek}`, sub: fruitName },
                { emoji: "🧘", title: "Your body", sub: topSymptom },
                { emoji: "🫧", title: "Top remedy", sub: topRemedy },
              ].map((card) => (
                <div key={card.title} className="flex-1 rounded-[14px]" style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.32)", padding: "10px 10px 9px", display: "flex", flexDirection: "column" as const, alignItems: "flex-start", gap: 4 }}>
                  <span style={{ fontSize: 18, marginBottom: 2 }}>{card.emoji}</span>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{card.title}</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, fontWeight: 400, color: "rgba(255,255,255,0.62)", lineHeight: 1.3 }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Prompts */}
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 16, marginBottom: 4, color: "rgba(255,255,255,0.50)", fontWeight: 600 }}>Suggested for week {currentWeek}</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => sendMessage(prompt)}
                  className="text-left belly-card-interactive"
                  style={{ background: "rgba(255,255,255,0.24)", border: "1.5px solid rgba(255,255,255,0.38)", borderRadius: 16, padding: "13px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white", lineHeight: 1.4 }}>{prompt}</p>
                </button>
              ))}
            </div>

            <button onClick={() => sendMessage("", true)}
              className="w-full text-left belly-card-interactive"
              style={{ background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.30)", borderRadius: 16, padding: "13px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>📷</span>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white" }}>Is this product safe to use?</p>
            </button>

            {/* Ambient card */}
            <div style={{ margin: "12px 0 0", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 16, padding: "14px 16px", textAlign: "center" as const }}>
              <p style={{ fontSize: 22, marginBottom: 6 }}>🌸</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 400, fontStyle: "italic", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>I'm here whenever you need me, mama.</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Available 24/7 · Natural guidance only</p>
            </div>
          </>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "assistant" && i === firstAssistantIdx && (
              <div className="flex items-center gap-1.5 mb-1">
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🌸</div>
                <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "var(--w50)", fontWeight: 500 }}>Belly</span>
              </div>
            )}
            <div className={`${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
              style={{ maxWidth: msg.role === "user" ? "80%" : "88%" }}>
              <div className="px-4 py-3 text-[13px] leading-[1.65]"
                style={msg.role === "user"
                  ? { background: "rgba(255,255,255,0.95)", color: "#3A1A00", borderRadius: "18px 18px 4px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", fontFamily: "'Outfit', system-ui", fontWeight: 500 }
                  : { background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)", color: "rgba(255,255,255,0.90)", borderRadius: "18px 18px 18px 4px", fontFamily: "'Outfit', system-ui" }
                }>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
                )}
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-0 [&>ul]:list-none [&>ul>li]:mb-1.5 [&>ul>li]:pl-0 [&>h3]:text-[12px] [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>h2]:text-[13px] [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>strong]:font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>
                    <ReactMarkdown>{typeof msg.content === "string" ? msg.content : getTextContent(msg.content)}</ReactMarkdown>
                  </div>
                ) : getTextContent(msg.content)}
              </div>
              {msg.role === "assistant" && (
                <p className="text-[10px] mt-1 px-1" style={{ color: "var(--w40)" }}>
                  This is wellness guidance, not medical advice. Always consult your care provider.
                </p>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex flex-col items-center py-4">
            <div className="relative flex items-center justify-center" style={{ width: 160, height: 160, margin: "24px auto" }}>
              {[60, 90, 120, 150].map((size, i) => (
                <div key={i} className="absolute rounded-full" style={{
                  width: size, height: size,
                  border: `1.5px dashed rgba(255,255,255,${[0.40, 0.25, 0.15, 0.08][i]})`,
                  animation: `ringPulse 2.4s ease-in-out infinite ${i * 0.3}s`,
                }} />
              ))}
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, fontStyle: "italic", color: "white", zIndex: 10, textAlign: "center" }}>
                Belly is thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {!profile?.is_premium && messageCount > 0 && (
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, color: "var(--w40)", textAlign: "center", padding: "4px 0", fontStyle: "italic" }}>
          {messageCount}/10 free messages today
        </p>
      )}

      {showPhotoMenu && (
        <div className="px-4 py-2 flex gap-2" style={{ background: "rgba(200,80,10,0.40)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <button onClick={() => { cameraInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "var(--c1)", color: "white", fontFamily: "'Outfit', system-ui" }}>
            📸 Take a photo
          </button>
          <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "var(--c1)", color: "white", fontFamily: "'Outfit', system-ui" }}>
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

      {/* Input bar */}
      <style>{`@keyframes sendGlow { 0%,100% { box-shadow: 0 2px 8px rgba(255,255,255,0.3); } 50% { box-shadow: 0 4px 20px rgba(255,255,255,0.6); } }`}</style>
      <div style={{ background: "rgba(255,255,255,0.15)", borderTop: "1px solid rgba(255,255,255,0.18)", padding: "10px 16px 14px", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.95)", borderRadius: 28, padding: "11px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}>
          <button onClick={() => setShowPhotoMenu(!showPhotoMenu)}
            className="shrink-0 flex items-center justify-center"
            style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.20)" }}>
            <Camera size={14} style={{ color: "white" }} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder={attachedImage ? "Ask about this product..." : "Ask anything..."}
            className="flex-1 text-sm outline-none bg-transparent placeholder:italic"
            style={{ color: "#3A1A00", fontFamily: "'Outfit', system-ui", fontStyle: "italic", border: "none", "--tw-placeholder-opacity": 1, "::placeholder": { color: "rgba(160,80,20,0.45)" } } as any}
          />
          {isStreaming ? (
            <button onClick={cancelStream} className="shrink-0 flex items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: "50%", background: "#FF6520" }}>
              <Square size={14} style={{ color: "white" }} />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)} disabled={!input.trim() && !attachedImage}
              className="shrink-0 flex items-center justify-center disabled:opacity-40"
              style={{ width: 36, height: 36, borderRadius: "50%", background: "#FF6520", ...(input.trim() && !isStreaming ? { animation: "sendGlow 2s ease-in-out infinite" } : {}) }}>
              <Send size={14} style={{ color: "white" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskDoula;
