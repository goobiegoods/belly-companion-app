import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
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
  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const displayName = titleCase(profile?.first_name || "") || "mama";

  const QUICK_PROMPTS = [
    `What's normal in week ${currentWeek}?`,
    "Natural nausea remedies",
    "Help me sleep better",
    "What should I avoid eating?",
    "Is this product safe? 📷",
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

  return (
    <div className="flex flex-col h-screen page-enter" style={{ background: "#FEF8F4" }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 belly-glass-nav shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <button onClick={() => navigate("/")} className="text-[12px] font-semibold mr-1" style={{ color: "#C4906A" }}>← Home</button>
          <h1 className="font-display text-[18px] font-semibold" style={{ color: "#C85828" }}>Ask the Doula</h1>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium belly-badge-glass" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>AI</span>
        </div>
        <p className="text-[11px]" style={{ color: "rgba(180,100,60,0.38)" }}>Your natural pregnancy guide</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <>
            <div className="belly-glass-card rounded-[17px] p-4 mt-4">
              <p className="font-display text-[18px] font-semibold" style={{ color: "#A84E28" }}>{getGreeting()}, {displayName} 🌸</p>
              <p className="text-[12px] mt-1 leading-[1.6]" style={{ color: "#C4906A" }}>
                You're in week {currentWeek}. Ask me anything — remedies, symptoms, what to expect, or just talk.
              </p>
            </div>

            <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginTop: 16, marginBottom: 4, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>Suggested for week {currentWeek}</p>

            <div className="grid grid-cols-2 gap-3">
              {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                <button key={prompt} onClick={() => sendMessage(prompt)}
                  className="belly-glass-card rounded-[17px] p-3 text-left belly-card-interactive">
                  <p className="font-display text-[12px] font-semibold" style={{ color: "#C4906A" }}>{prompt}</p>
                </button>
              ))}
            </div>
            <button onClick={() => sendMessage("", true)}
              className="w-full belly-glass-card rounded-[17px] p-3 text-left belly-card-interactive">
              <p className="font-display text-[12px] font-semibold" style={{ color: "#C4906A" }}>📷 Is this product safe to use?</p>
            </button>
          </>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}>
              <div className={`px-4 py-3 text-[13px] leading-[1.65] ${
                msg.role === "user" ? "rounded-[18px_18px_4px_18px]" : "rounded-[18px_18px_18px_4px]"
              }`} style={msg.role === "user"
                ? { background: "linear-gradient(140deg, #FF7E48, #FFA070)", color: "white" }
                : { background: "rgba(255,255,255,0.68)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "0.5px solid rgba(255,170,130,0.22)", color: "#A84E28" }
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
              <p className="font-display text-[13px] italic text-center z-10" style={{ color: "#C4906A" }}>
                Belly is thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {!profile?.is_premium && messageCount > 0 && (
        <div className="px-5 py-2" style={{ background: "rgba(255,200,170,0.15)", borderTop: "0.5px solid rgba(255,170,130,0.2)" }}>
          <p className="text-[11px] text-center" style={{ color: "#C4906A" }}>{messageCount}/10 free messages today</p>
        </div>
      )}

      {showPhotoMenu && (
        <div className="px-4 py-2 belly-glass-nav flex gap-2">
          <button onClick={() => { cameraInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold belly-btn-primary" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>
            📸 Take a photo
          </button>
          <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
            className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold belly-btn-primary" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>
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

      {/* Input */}
      <div className="px-4 py-3 belly-glass-nav">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPhotoMenu(!showPhotoMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,200,170,0.3)" }}>
            <Camera size={16} style={{ color: "#C4906A" }} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder={attachedImage ? "Ask about this product..." : "Ask anything about your pregnancy..."}
            className="flex-1 h-10 rounded-[10px] px-4 text-sm outline-none belly-input-focus"
            style={{ border: "0.5px solid rgba(255,170,130,0.22)", background: "rgba(255,255,255,0.68)", color: "#A84E28" }}
          />
          {isStreaming ? (
            <button onClick={cancelStream} className="w-10 h-10 rounded-[10px] flex items-center justify-center belly-btn-primary" style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)" }}>
              <Square size={14} style={{ color: "white" }} />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)} disabled={!input.trim() && !attachedImage}
              className="w-10 h-10 rounded-[10px] flex items-center justify-center disabled:opacity-40 belly-btn-primary" style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)" }}>
              <Send size={16} style={{ color: "white" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskDoula;
