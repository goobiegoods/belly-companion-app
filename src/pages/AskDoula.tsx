import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What's normal this trimester?",
  "Natural nausea remedies",
  "Help me sleep better",
  "What should I avoid eating?",
];

const AskDoula = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    if (!profile?.is_premium && messageCount >= 10) {
      toast.error("You've reached your daily limit. Upgrade to Premium for unlimited messages.");
      return;
    }

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setMessageCount(c => c + 1);

    if (user) {
      await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: text });
    }

    const abortController = new AbortController();
    abortRef.current = abortController;
    let assistantContent = "";

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/belly-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
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

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FFF8F5" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 bg-white" style={{ borderBottom: "1px solid #FFE4D4" }}>
        <div className="flex items-center gap-2 mb-0.5">
          <button onClick={() => navigate("/")} className="text-[12px] font-semibold mr-1" style={{ color: "#D4906A" }}>← Home</button>
          <h1 className="font-display text-[18px] font-bold" style={{ color: "#2A1200" }}>Ask the Doula</h1>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#FFF0E8", color: "#D4906A" }}>AI</span>
        </div>
        <p className="text-[11px]" style={{ color: "#D4B0A0" }}>Your natural pregnancy guide</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-3 mt-8">
            {QUICK_PROMPTS.map(prompt => (
              <button key={prompt} onClick={() => sendMessage(prompt)}
                className="rounded-[16px] p-3 text-left active:scale-[0.975] transition-transform"
                style={{ background: "white", border: "1px solid #FFE4D4" }}>
                <p className="font-display text-[13px] font-bold" style={{ color: "#D4906A" }}>{prompt}</p>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}>
              <div className={`px-4 py-3 text-[13px] leading-[1.65] ${
                msg.role === "user" ? "rounded-[18px_18px_4px_18px]" : "rounded-[18px_18px_18px_4px]"
              }`} style={msg.role === "user"
                ? { background: "#FFB899", color: "#2A1200" }
                : { background: "white", border: "1px solid #FFE4D4", color: "#2A1200" }
              }>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-0 [&>ul]:list-none [&>ul>li]:mb-1.5 [&>ul>li]:pl-0 [&>h3]:text-[12px] [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>h2]:text-[13px] [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>strong]:font-semibold" style={{ color: "#2A1200" }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
              {msg.role === "assistant" && (
                <p className="text-[10px] mt-1 px-1" style={{ color: "#D4B0A0" }}>
                  This is wellness guidance, not medical advice. Always consult your care provider.
                </p>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "#D4906A" }}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full belly-dot-1" style={{ background: "#D4906A" }} />
              <div className="w-1.5 h-1.5 rounded-full belly-dot-2" style={{ background: "#D4906A" }} />
              <div className="w-1.5 h-1.5 rounded-full belly-dot-3" style={{ background: "#D4906A" }} />
            </div>
            Belly is thinking...
          </div>
        )}
      </div>

      {/* Message limit */}
      {!profile?.is_premium && messageCount > 0 && (
        <div className="px-5 py-2" style={{ background: "#FFF4EE", borderTop: "1px solid #FFCDB4" }}>
          <p className="text-[11px] text-center" style={{ color: "#D4906A" }}>{messageCount}/10 free messages today</p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white" style={{ borderTop: "1px solid #FFE4D4" }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask anything about your pregnancy..."
            className="flex-1 h-10 rounded-[10px] px-4 text-sm outline-none"
            style={{ border: "1px solid #FFE4D4", background: "#FFF8F5", color: "#2A1200" }}
          />
          {isStreaming ? (
            <button onClick={cancelStream} className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: "#FFB899" }}>
              <Square size={14} style={{ color: "#2A1200" }} />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)} disabled={!input.trim()}
              className="w-10 h-10 rounded-[10px] flex items-center justify-center disabled:opacity-40" style={{ background: "#FFB899" }}>
              <Send size={16} style={{ color: "#2A1200" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskDoula;
