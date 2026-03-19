import { useState, useRef, useEffect } from "react";
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

  // Load today's message count
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

    // Save user message
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
        if (resp.status === 429) { toast.error("Too many requests. Please wait a moment."); }
        else if (resp.status === 402) { toast.error("AI credits exhausted. Please try again later."); }
        else { toast.error("Something went wrong. Please try again."); }
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

      // Save assistant message
      if (user && assistantContent) {
        await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistantContent });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error("Connection failed. Please try again.");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const cancelStream = () => {
    abortRef.current?.abort();
  };

  const showUpsell = !profile?.is_premium && messages.filter(m => m.role === "assistant").length > 0 && messages.filter(m => m.role === "assistant").length % 3 === 0;

  return (
    <div className="flex flex-col h-screen bg-belly-bg">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 bg-card border-b border-belly-card-border">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[18px] font-bold text-foreground">Ask the Doula</h1>
          <span className="text-[9px] bg-belly-icon-bg text-belly-accent px-2 py-0.5 rounded-pill font-medium">AI</span>
        </div>
        <p className="text-[11px] text-belly-text-muted">Your natural pregnancy guide</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-3 mt-8">
            {QUICK_PROMPTS.map(prompt => (
              <button key={prompt} onClick={() => sendMessage(prompt)} className="bg-card border border-belly-card-border rounded-card p-3 text-left belly-press">
                <p className="font-display text-[13px] font-bold text-belly-accent">{prompt}</p>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}>
              <div className={`px-4 py-3 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-[18px_18px_4px_18px]"
                  : "bg-card border border-belly-card-border text-foreground rounded-[18px_18px_18px_4px]"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
              {msg.role === "assistant" && (
                <p className="text-[10px] text-belly-text-hint mt-1 px-1">
                  This is wellness guidance, not medical advice. Always consult your care provider.
                </p>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-belly-accent text-xs">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-belly-accent belly-dot-1" />
              <div className="w-1.5 h-1.5 rounded-full bg-belly-accent belly-dot-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-belly-accent belly-dot-3" />
            </div>
            Belly is thinking...
          </div>
        )}

        {showUpsell && (
          <div className="bg-belly-upsell-bg border border-belly-upsell-border rounded-card p-3 text-center">
            <p className="text-[12px] text-belly-accent">Want a certified doula to review your questions? <span className="font-semibold">Upgrade to Premium</span></p>
          </div>
        )}
      </div>

      {/* Message limit banner */}
      {!profile?.is_premium && messageCount > 0 && (
        <div className="px-5 py-2 bg-belly-upsell-bg border-t border-belly-upsell-border">
          <p className="text-[11px] text-belly-accent text-center">{messageCount}/10 free messages today</p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-card border-t border-belly-card-border">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask anything about your pregnancy..."
            className="flex-1 h-10 rounded-input border border-belly-card-border bg-background px-4 text-sm belly-input-focus placeholder:text-belly-text-hint"
          />
          {isStreaming ? (
            <button onClick={cancelStream} className="w-10 h-10 rounded-input bg-primary flex items-center justify-center belly-btn-press">
              <Square size={14} className="text-primary-foreground" />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="w-10 h-10 rounded-input bg-primary flex items-center justify-center belly-btn-press disabled:opacity-40">
              <Send size={16} className="text-primary-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskDoula;
