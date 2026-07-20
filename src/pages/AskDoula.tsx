import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { Send, Square, Camera, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { PremiumModal } from "@/components/PremiumModal";
import { SceneBackground, GhHeader, BellaOrb } from "@/components/golden";

interface Message {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; source?: any }>;
  imageUrl?: string;
}

type CategoryTone = "ember" | "teal" | "magenta";

const TILE_ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.8,
  width: 20,
  height: 20,
  style: { margin: "0 auto 7px", display: "block" },
};
const TONE_STROKE: Record<CategoryTone, string> = {
  ember: "#ffb187",
  teal: "#7fe0d3",
  magenta: "#f79fc0",
};

const AskDoula = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [freeLimit, setFreeLimit] = useState(10);
  const [serverBlocked, setServerBlocked] = useState(false);
  const [trendingCount, setTrendingCount] = useState<number | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; url: string } | null>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  // Force the next messages-update to scroll (set when the user sends a message).
  const forceScrollRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamBufferRef = useRef("");
  const displayIndexRef = useRef(0);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStreamingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const safetyScanRef = useRef(false);
  const safetyCameraInputRef = useRef<HTMLInputElement>(null);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekData = getWeekData(currentWeek);
  const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
  const displayName = titleCase(profile?.first_name || "") || "mama";

  const quotaExhausted = !profile?.is_premium && (serverBlocked || messageCount >= freeLimit);

  const CATEGORY_TILES: { label: string; tone: CategoryTone; icon: JSX.Element; action: () => void }[] = [
    {
      label: "Nausea", tone: "ember",
      icon: <svg {...TILE_ICON_PROPS} stroke={TONE_STROKE.ember}><path d="M12 3c-5 4-8 8-8 12a8 8 0 0 0 16 0c0-4-3-8-8-12z" /></svg>,
      action: () => sendMessage("I'm feeling nauseous — what can help right now?"),
    },
    {
      label: "Sleep", tone: "teal",
      icon: <svg {...TILE_ICON_PROPS} stroke={TONE_STROKE.teal}><path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5z" /></svg>,
      action: () => sendMessage("Help me sleep tonight"),
    },
    {
      label: "Safe?", tone: "ember",
      icon: <svg {...TILE_ICON_PROPS} stroke={TONE_STROKE.ember}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /></svg>,
      action: () => handleSafetyChipClick(),
    },
    {
      label: "What to eat", tone: "teal",
      icon: <svg {...TILE_ICON_PROPS} stroke={TONE_STROKE.teal}><path d="M4 13c4 0 6-3 8-3s4 3 8 3M6 17c3 0 5-2 6-2s3 2 6 2" /></svg>,
      action: () => sendMessage(`What should I be eating at week ${currentWeek}?`),
    },
    {
      label: "Herbal", tone: "teal",
      icon: <svg {...TILE_ICON_PROPS} stroke={TONE_STROKE.teal}><path d="M12 21V9M12 9c0-4-3-6-7-6 0 4 3 6 7 6zm0 0c0-4 3-6 7-6 0 4-3 6-7 6z" /></svg>,
      action: () => sendMessage("Which herbs are safe for me right now?"),
    },
    {
      label: "Labor prep", tone: "magenta",
      icon: <svg {...TILE_ICON_PROPS} stroke={TONE_STROKE.magenta}><path d="M12 3c-1 3-3 4-3 7a3 3 0 0 0 6 0c0-3-2-4-3-7z" /><path d="M8 21h8" /></svg>,
      action: () => sendMessage("How can I start preparing for labor?"),
    },
  ];

  // Follow the stream only while the user is at (or near) the bottom. If they
  // scroll up to reread something mid-stream, leave them alone; following
  // resumes when they scroll back down or send a new message.
  useEffect(() => {
    if (messages.length === 0) return;
    const el = chatScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (forceScrollRef.current || distanceFromBottom < 100) {
      forceScrollRef.current = false;
      // Instant while streaming: chunks arrive faster than a smooth animation
      // finishes, which would leave us "behind" and falsely read as scrolled-up.
      messagesEndRef.current?.scrollIntoView({
        behavior: isStreamingRef.current ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  useEffect(() => {
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); };
  }, []);

  // Daily count is real: today's user rows in chat_messages.
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

  // Free limit comes from app_config so the admin setting actually applies.
  useEffect(() => {
    supabase
      .from("app_config")
      .select("free_message_limit")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.free_message_limit && data.free_message_limit > 0) {
          setFreeLimit(data.free_message_limit);
        }
      });
  }, []);

  // Trending: how many mamas posted questions this week.
  useEffect(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("category", "Questions")
      .gte("created_at", weekAgo)
      .then(({ count }) => setTrendingCount(count ?? null));
  }, []);

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
        setTimeout(() => sendMessage(prompt, img), 50);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSafetyChipClick = () => {
    safetyScanRef.current = true;
    safetyCameraInputRef.current?.click();
  };

  const sendMessage = async (text: string, imageOverride?: { base64: string; url: string }) => {
    const activeImage = imageOverride || attachedImage;
    if ((!text.trim() && !activeImage) || isStreaming) return;
    if (quotaExhausted) {
      toast.error("You've reached your daily limit. Upgrade to Premium for unlimited messages.");
      return;
    }

    // Sending always snaps the view back to the bottom, even if scrolled up.
    forceScrollRef.current = true;

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
    streamBufferRef.current = "";
    displayIndexRef.current = 0;
    isStreamingRef.current = true;

    // Typewriter: drips buffered content at ~200 chars/sec; self-terminates when
    // the buffer is drained AND the network stream is finished.
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    typeTimerRef.current = setInterval(() => {
      const buf = streamBufferRef.current;
      const pos = displayIndexRef.current;
      if (pos >= buf.length) {
        if (!isStreamingRef.current) {
          clearInterval(typeTimerRef.current!);
          typeTimerRef.current = null;
        }
        return;
      }
      const newPos = Math.min(pos + 4, buf.length);
      displayIndexRef.current = newPos;
      const text = buf.slice(0, newPos);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: text } : m);
        }
        return [...prev, { role: "assistant", content: text }];
      });
    }, 20);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const resp = await fetch("/api/belly-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
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
        if (resp.status === 429) {
          toast.error("Too many requests. Please wait a moment.");
        } else if (resp.status === 402) {
          toast.error("AI credits exhausted. Please try again later.");
        } else if (resp.status === 403) {
          setServerBlocked(true);
          toast.error("You've reached your daily limit. Upgrade to Premium for unlimited messages.");
        } else {
          try {
            const errBody = await resp.json();
            toast.error(errBody?.error || "Something went wrong. Please try again.");
          } catch {
            toast.error("Something went wrong. Please try again.");
          }
        }
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
              streamBufferRef.current = assistantContent;
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
      isStreamingRef.current = false;
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const cancelStream = () => { abortRef.current?.abort(); };

  const getTextContent = (content: Message["content"]) => {
    if (typeof content === "string") return content;
    return content.find(c => c.type === "text")?.text || "";
  };

  const markdownStyles =
    "prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-2 " +
    "[&>ul]:mb-2 [&>ul]:pl-0 [&>ul]:list-none [&>ul>li]:mb-1.5 [&>ul>li]:pl-0 " +
    "[&_h2]:text-[13px] [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-[var(--gold)] " +
    "[&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-[var(--gold)] " +
    "[&_strong]:font-semibold [&_strong]:text-[var(--gold)] [&_em]:text-[#ffb187]";

  const renderAssistantBubble = (content: string, imageUrl?: string) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <BellaOrb size={26} style={{ marginTop: 4 }} />
      <div className="mr-auto" style={{ maxWidth: "85%" }}>
        <div
          className="gh-glass-dark px-4 py-3 text-[14px] leading-[1.65]"
          style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui" }}
        >
          {imageUrl && (
            <img src={imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
          )}
          <div className={markdownStyles} style={{ color: "var(--cream)" }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SceneBackground scene="ask">
      <div className="gh-chat-screen" style={{ display: "flex", flexDirection: "column", height: "var(--vvh, 100dvh)", overflow: "clip" }}>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
        <input ref={safetyCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        <div style={{ flexShrink: 0 }}>
          <GhHeader
            brand="Ask Bella"
            tag="knows your whole history"
            showOrb
            weekPill={`wk ${currentWeek}`}
            glowStyle={{ left: "50%", right: "auto", top: -70, transform: "translateX(-50%)" }}
          />
        </div>

        {/* Scrollable content */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && !isStreaming && (
            <>
              <div>
                <div className="gh-section-label">what's going on right now</div>
                <div style={{ display: "flex", gap: 13, fontSize: 10.5, color: "rgba(251,238,224,0.55)", marginBottom: 11 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#ffb187", display: "inline-block" }} />physical
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#7fe0d3", display: "inline-block" }} />nutrition + rest
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#f79fc0", display: "inline-block" }} />big moments
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {CATEGORY_TILES.map((t) => (
                    <button key={t.label} className={`gh-tile gh-tile-${t.tone}`} onClick={t.action}>
                      {t.icon}
                      <span style={{ fontSize: 11, color: "var(--cream)", fontWeight: 500, display: "block" }}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
                {trendingCount != null && trendingCount > 0 && (
                  <div style={{ fontSize: 11.5, color: "rgba(251,238,224,0.65)", margin: "11px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#F2B647" strokeWidth="2">
                      <path d="M4 16l5-5 4 4 7-8" />
                    </svg>
                    trending — <b style={{ color: "var(--gold)", fontWeight: 600 }}>{trendingCount} mamas</b> asked this week
                  </div>
                )}
              </div>

              {/* Bella's week note */}
              <div className="gh-glass-dark" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <BellaOrb size={20} />
                  <span className="font-gh-serif" style={{ fontStyle: "italic", fontWeight: 600, color: "var(--gold)", fontSize: 13.5 }}>
                    Bella
                  </span>
                </div>
                <p className="font-gh-serif" style={{ fontSize: 15, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>
                  "{weekData.naturalTip}"
                </p>
              </div>
            </>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "assistant" ? (
                renderAssistantBubble(getTextContent(msg.content), msg.imageUrl)
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "78%" }}>
                    <div
                      className="px-[14px] py-3 text-[14px] leading-[1.55]"
                      style={{
                        background: "rgba(232,98,46,0.28)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        color: "var(--cream)",
                        borderRadius: 18,
                        fontFamily: "'Inter', system-ui",
                        fontWeight: 500,
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Attached" className="w-full rounded-[12px] mb-2 max-h-[200px] object-cover" />
                      )}
                      {getTextContent(msg.content)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <BellaOrb size={26} style={{ marginTop: 4 }} />
              <div className="gh-glass-dark" style={{ padding: "10px 14px", display: "inline-flex", gap: 5, alignItems: "center", alignSelf: "flex-start" }}>
                {[0, 0.15, 0.3].map(d => (
                  <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: `typingBounce 1.2s infinite ${d}s`, display: "inline-block" }} />
                ))}
              </div>
            </div>
          )}

          {quotaExhausted && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <BellaOrb size={26} style={{ marginTop: 4 }} />
              <div style={{ maxWidth: "85%" }}>
                <div className="gh-glass-dark px-4 py-3" style={{ fontFamily: "'Inter', system-ui" }}>
                  <p style={{ fontSize: 14, color: "var(--cream)", lineHeight: 1.65, marginBottom: 10 }}>
                    You've used your {freeLimit} free messages for today ✨ Upgrade to Premium for unlimited access.
                  </p>
                  <button
                    onClick={() => setShowPremium(true)}
                    style={{
                      background: "linear-gradient(135deg, var(--gold), var(--ember))",
                      color: "var(--night)", border: "none", borderRadius: 20,
                      padding: "8px 18px", fontWeight: 700, fontSize: 12, cursor: "pointer",
                      fontFamily: "'Inter', system-ui",
                    }}
                  >
                    Go Premium →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showPhotoMenu && (
          <div className="px-4 py-2 flex gap-2" style={{ background: "rgba(10,6,16,0.7)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <button
              onClick={() => { cameraInputRef.current?.click(); setShowPhotoMenu(false); }}
              className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold"
              style={{ background: "rgba(255,255,255,0.1)", color: "var(--cream)", fontFamily: "'Inter', system-ui" }}
            >
              📸 Take a photo
            </button>
            <button
              onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
              className="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold"
              style={{ background: "rgba(255,255,255,0.1)", color: "var(--cream)", fontFamily: "'Inter', system-ui" }}
            >
              🖼️ Choose from library
            </button>
          </div>
        )}

        {attachedImage && (
          <div className="px-4 py-2" style={{ background: "rgba(10,6,16,0.7)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="relative inline-block">
              <img src={attachedImage.url} alt="Preview" className="w-[60px] h-[60px] rounded-[10px] object-cover" style={{ border: "1px solid rgba(255,255,255,0.2)" }} />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "var(--night)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <X size={10} style={{ color: "var(--cream)" }} />
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div style={{ flexShrink: 0, padding: "10px 16px 12px", background: "rgba(10,6,16,0.4)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {!profile?.is_premium && (
            <>
              <div className="font-gh-mono" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 6px", fontSize: 10.5, color: "rgba(251,238,224,0.6)" }}>
                <span>today's questions</span>
                <span>{Math.min(messageCount, freeLimit)} of {freeLimit}</span>
              </div>
              <div className="gh-daily-track" style={{ marginBottom: 10 }}>
                <div className="gh-daily-fill" style={{ width: `${Math.min(100, Math.round((messageCount / freeLimit) * 100))}%` }} />
              </div>
            </>
          )}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 18, padding: "6px 6px 6px 14px",
            }}
          >
            {(() => {
              const lastMsg = messages[messages.length - 1];
              const showSpinner = isStreaming && (!!lastMsg?.imageUrl || (messages[messages.length - 2]?.imageUrl && lastMsg?.role === "assistant"));
              return (
                <button
                  onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                  disabled={isStreaming}
                  className="shrink-0 flex items-center justify-center"
                  style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none" }}
                >
                  {showSpinner
                    ? <Loader2 size={14} className="animate-spin" style={{ color: "var(--gold)" }} />
                    : <Camera size={14} style={{ color: "var(--gold)" }} />}
                </button>
              );
            })()}
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask anything, gently…"
              disabled={quotaExhausted}
              className="flex-1 outline-none bg-transparent"
              style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui", fontSize: 14, border: "none" }}
            />
            {isStreaming ? (
              <button onClick={cancelStream} className="shrink-0 flex items-center justify-center gh-arrow-btn" style={{ width: 36, height: 36 }}>
                <Square size={14} />
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={(!input.trim() && !attachedImage) || quotaExhausted}
                className="shrink-0 flex items-center justify-center gh-arrow-btn"
                style={{
                  width: 36, height: 36,
                  opacity: ((!input.trim() && !attachedImage) || quotaExhausted) ? 0.5 : 1,
                  cursor: ((!input.trim() && !attachedImage) || quotaExhausted) ? "not-allowed" : "pointer",
                }}
              >
                <Send size={14} />
              </button>
            )}
          </div>
          {profile?.is_premium && (
            <p className="font-gh-mono" style={{ textAlign: "center", marginTop: 7, fontSize: 10, color: "rgba(251,238,224,0.5)" }}>
              unlimited messages ✨
            </p>
          )}
        </div>
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </SceneBackground>
  );
};

export default AskDoula;
