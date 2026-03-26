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
    <div className="flex flex-col h-screen page-enter" style={{ background: "#FEF8F4" }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 belly-glass-nav shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <button onClick={() => navigate("/")} className="text-[12px] font-semibold mr-1" style={{ color: "#C4906A" }}>← Home</button>
          <h1 className="font-display text-[18px] font-semibold" style={{ color: "#C85828" }}>Ask the Doula</h1>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>AI</span>
        </div>
        <p className="text-[11px]" style={{ color: "rgba(180,100,60,0.38)" }}>Your natural pregnancy guide</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <>
            {/* Welcome hero card */}
            <div className="rounded-[20px] p-[18px_16px] mt-2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FF7E48, #FFA070, #FFBE98)", boxShadow: "0 8px 24px rgba(255,110,60,0.2)" }}>
              <div className="absolute rounded-full" style={{ right: -16, top: -16, width: 80, height: 80, background: "rgba(255,255,255,0.1)" }} />
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", fontSize: 18 }}>🌸</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Ask the Doula</span>
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 8, background: "rgba(255,255,255,0.2)", border: "0.5px solid rgba(255,255,255,0.3)", color: "white" }}>AI</span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 600, color: "white", fontFamily: "Georgia, serif", marginTop: 10, letterSpacing: -0.2 }}>
                {getGreeting()}, {displayName} 🌸
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, marginTop: 4, fontStyle: "italic" }}>
                You're in week {currentWeek}. Ask me anything — remedies, symptoms, what to expect, or just talk.
              </p>
            </div>

            {/* Week context strip — 3 mini cards */}
            <div className="flex gap-2 mt-3">
              <div className="flex-1 rounded-[12px] p-[8px_10px]" style={{ background: "rgba(255,240,230,0.85)", border: "0.5px solid rgba(255,180,140,0.3)" }}>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 14 }}>🥑</span>
                  <div>
                    <p style={{ fontSize: 8, fontWeight: 600, color: "#A84E28" }}>Week {currentWeek}</p>
                    <p style={{ fontSize: 7, color: "#C4906A" }}>{fruitName}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 rounded-[12px] p-[8px_10px]" style={{ background: "rgba(235,252,240,0.85)", border: "0.5px solid rgba(140,210,160,0.3)" }}>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 14 }}>🧘</span>
                  <div>
                    <p style={{ fontSize: 8, fontWeight: 600, color: "#40A060" }}>Your body</p>
                    <p style={{ fontSize: 7, color: "#6AAA78" }}>{topSymptom}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 rounded-[12px] p-[8px_10px]" style={{ background: "rgba(240,232,255,0.85)", border: "0.5px solid rgba(180,140,240,0.3)" }}>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 14 }}>🫧</span>
                  <div>
                    <p style={{ fontSize: 8, fontWeight: 600, color: "#7040A0" }}>Top remedy</p>
                    <p style={{ fontSize: 7, color: "#9070C0" }}>{topRemedy}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested prompts */}
            <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginTop: 16, marginBottom: 4, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>Suggested for week {currentWeek}</p>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => sendMessage(prompt)}
                  className="rounded-[13px] p-[9px_11px] text-left belly-card-interactive"
                  style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.2)", backdropFilter: "blur(12px)", boxShadow: "0 1px 8px rgba(255,140,90,0.05)" }}>
                  <p style={{ fontSize: 9, fontWeight: 500, color: "#C4784A", lineHeight: 1.4, fontFamily: "Georgia, serif" }}>{prompt}</p>
                </button>
              ))}
            </div>

            {/* Camera card */}
            <button onClick={() => sendMessage("", true)}
              className="w-full rounded-[13px] p-[9px_11px] text-left belly-card-interactive"
              style={{ background: "rgba(245,238,255,0.6)", border: "0.5px solid rgba(200,160,255,0.25)", backdropFilter: "blur(12px)" }}>
              <p style={{ fontSize: 9, fontWeight: 500, color: "#9060D0", fontFamily: "Georgia, serif" }}>📷 Is this product safe to use?</p>
            </button>
          </>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {/* Belly avatar on first assistant message */}
            {msg.role === "assistant" && i === firstAssistantIdx && (
              <div className="flex items-center gap-1.5 mb-1">
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #FF7E48, #FFA070)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🌸</div>
                <span style={{ fontSize: 9, color: "#C4906A", fontWeight: 500 }}>Belly</span>
              </div>
            )}
            <div className={`${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
              style={{ maxWidth: msg.role === "user" ? "80%" : "88%" }}>
              <div className="px-4 py-3 text-[13px] leading-[1.65]"
                style={msg.role === "user"
                  ? { background: "linear-gradient(135deg, #FF7840, #FFAB80)", color: "white", borderRadius: "18px 18px 4px 18px", boxShadow: "0 3px 12px rgba(255,120,64,0.2)" }
                  : { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "0.5px solid rgba(255,170,130,0.2)", color: "#A84E28", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 10px rgba(255,140,90,0.07)" }
                }>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
                )}
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-0 [&>ul]:list-none [&>ul>li]:mb-1.5 [&>ul>li]:pl-0 [&>h3]:text-[12px] [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>h2]:text-[13px] [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>strong]:font-semibold" style={{ color: "#A84E28" }}>
                    <ReactMarkdown>{typeof msg.content === "string" ? msg.content : getTextContent(msg.content)}</ReactMarkdown>
                  </div>
                ) : getTextContent(msg.content)}
              </div>
              {msg.role === "assistant" && (
                <p className="text-[10px] mt-1 px-1" style={{ color: "rgba(180,100,60,0.38)" }}>
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
                  border: "1.5px dashed rgba(255,170,130,0.4)",
                  animation: `ringPulse 2.4s ease-in-out infinite ${i * 0.3}s`,
                }} />
              ))}
              <p style={{ fontSize: 11, fontStyle: "italic", color: "#E07040", fontFamily: "Georgia, serif", zIndex: 10, textAlign: "center" }}>
                Belly is thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {!profile?.is_premium && messageCount > 0 && (
        <p style={{ fontSize: 10, color: "rgba(180,100,60,0.4)", textAlign: "center", padding: "4px 0", fontStyle: "italic" }}>
          {messageCount}/10 free messages today
        </p>
      )}

      {showPhotoMenu && (
        <div className="px-4 py-2 belly-glass-nav flex gap-2">
          <button onClick={() => { cameraInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>
            📸 Take a photo
          </button>
          <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>
            🖼️ Choose from library
          </button>
        </div>
      )}

      {attachedImage && (
        <div className="px-4 py-2" style={{ background: "rgba(255,255,255,0.9)", borderTop: "0.5px solid rgba(255,170,130,0.2)" }}>
          <div className="relative inline-block">
            <img src={attachedImage.url} alt="Preview" className="w-[60px] h-[60px] rounded-[10px] object-cover" style={{ border: "0.5px solid rgba(255,170,130,0.22)" }} />
            <button onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center" style={{ border: "0.5px solid rgba(255,170,130,0.22)" }}>
              <X size={10} style={{ color: "#C4906A" }} />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 belly-glass-nav">
        <div className="flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.88)", border: "0.5px solid rgba(255,170,130,0.25)", borderRadius: 28, padding: "4px 6px 4px 12px", boxShadow: "0 2px 14px rgba(255,140,90,0.1)", backdropFilter: "blur(16px)" }}>
          <button onClick={() => setShowPhotoMenu(!showPhotoMenu)}
            className="shrink-0 flex items-center justify-center"
            style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,200,170,0.3)" }}>
            <Camera size={14} style={{ color: "#C85828" }} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder={attachedImage ? "Ask about this product..." : "Ask anything..."}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "#A84E28", fontStyle: "italic", border: "none" }}
          />
          {isStreaming ? (
            <button onClick={cancelStream} className="shrink-0 flex items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(145deg, #FF7840, #FFAB80)" }}>
              <Square size={14} style={{ color: "white" }} />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)} disabled={!input.trim() && !attachedImage}
              className="shrink-0 flex items-center justify-center disabled:opacity-40"
              style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(145deg, #FF7840, #FFAB80)", boxShadow: input.trim() ? "0 3px 10px rgba(255,120,64,0.35)" : "none", animation: input.trim() ? "sendPulse 2s ease-in-out infinite" : "none" }}>
              <Send size={14} style={{ color: "white" }} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sendPulse {
          0%, 100% { box-shadow: 0 3px 10px rgba(255,120,64,0.35); }
          50% { box-shadow: 0 3px 20px rgba(255,120,64,0.6); }
        }
      `}</style>
    </div>
  );
};

export default AskDoula;
