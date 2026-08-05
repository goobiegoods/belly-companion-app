import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SceneBackground, BellaOrb } from "@/components/golden";
import { WelcomePaywall } from "@/components/WelcomePaywall";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// opening: Bella's personalized opener is streaming in.
// awaitReply: her one free reply is available.
// replying: Bella's second message is streaming.
// paywall: the exchange is complete — invite her to Pro.
type Phase = "opening" | "awaitReply" | "replying" | "paywall";

const ordinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const markdownStyles =
  "prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-2 " +
  "[&>ul]:mb-2 [&>ul]:pl-0 [&>ul]:list-none [&>ul>li]:mb-1.5 [&>ul>li]:pl-0 " +
  "[&_h2]:text-[13px] [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-[var(--gold)] " +
  "[&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-[var(--gold)] " +
  "[&_strong]:font-semibold [&_strong]:text-[var(--gold)] [&_em]:text-[#ffb187]";

const Welcome = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>("opening");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Guards the mount effect against double-fire so the opener (a real
  // Anthropic call) is only ever requested once.
  const startedRef = useRef(false);
  // Read the done-flag once per mount: setting it mid-flow (after the
  // exchange) must not trigger the redirect guard below.
  const doneFlagRef = useRef<boolean | null>(null);
  if (user && doneFlagRef.current === null) {
    doneFlagRef.current = localStorage.getItem(`belly-welcome-done-${user.id}`) === "1";
  }

  const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
  const displayName = titleCase(profile?.first_name || "") || "mama";
  const currentWeek =
    profile?.season === "pregnant" && profile.due_date ? getCurrentWeek(profile.due_date) : null;

  const markDone = () => {
    if (user) localStorage.setItem(`belly-welcome-done-${user.id}`, "1");
  };

  const finishToHome = () => {
    markDone();
    navigate("/", { replace: true });
  };

  // The hidden priming turn: never shown in the UI and never written to
  // chat_messages (so it costs no free-message quota). It carries her
  // onboarding answers so Bella's very first words reference them.
  const buildPrime = (): string => {
    const a = (profile?.onboarding_answers ?? {}) as Record<string, string | string[]>;
    const get = (k: string) => {
      const v = a[k];
      return Array.isArray(v) ? v.join(", ") : v || "";
    };
    let situation = "";
    switch (profile?.season) {
      case "pregnant":
        situation =
          `I'm ${currentWeek ?? "some"} weeks pregnant — my ${ordinal(profile.pregnancy_number ?? 1)} pregnancy. ` +
          `What's been hardest lately: ${get("struggle") || "just finding my footing"}. ` +
          `My wellness approach: ${get("philosophy") || "still figuring it out"}.`;
        break;
      case "postpartum":
        situation =
          `I'm postpartum — I'm not currently pregnant. My baby is ${get("babyAge") || "still very little"}, ` +
          `and recovery has felt: ${get("recovery") || "up and down"}. ` +
          `What's been hardest lately: ${get("struggle") || "finding my footing"}.`;
        break;
      case "raising_little_ones":
        situation =
          `I'm a mama of little ones aged ${get("childrenAges") || "young"} — I'm not currently pregnant. ` +
          `My biggest daily challenge: ${get("dailyChallenge") || "keeping up"}. ` +
          `What would help me most: ${get("mainInterest") || "support for me"}.`;
        break;
      case "trying_to_conceive":
        situation =
          `We're trying to conceive — I'm not pregnant yet. How long we've been trying: ${get("tryingDuration") || "a little while"}. ` +
          `My main focus: ${get("mainFocus") || "understanding my body"}. ` +
          `My wellness approach: ${get("philosophy") || "still figuring it out"}.`;
        break;
      default:
        situation =
          `I'm here for my own wellness — I'm not currently pregnant. My main goal: ${get("mainGoal") || "feeling better"}. ` +
          `I'm drawn to: ${get("interests") || "natural wellness"}.`;
    }
    return (
      `(Context for you, Bella — I just finished onboarding and haven't typed anything yet. Please open the conversation yourself.) ` +
      `My name is ${displayName}. ${situation} ` +
      `Open by greeting me warmly by name, acknowledge exactly where I am and what I said has been hard, ` +
      `offer one small, specific piece of comfort or guidance for it, and end with one gentle question inviting me to tell you more. ` +
      `Keep it short — two paragraphs at most.`
    );
  };

  // Streams one turn from /api/belly-chat, appending into a trailing assistant
  // bubble. Duplicated from AskDoula's SSE reader on purpose — that screen is
  // out of scope to refactor. Returns the full assistant text ("" on failure).
  const streamTurn = async (apiMessages: { role: string; content: string }[]): Promise<string> => {
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
          season: profile?.season ?? null,
          currentWeek,
          pregnancyNumber:
            !profile?.season || profile.season === "pregnant" ? (profile?.pregnancy_number ?? 1) : null,
          todaysMood: null,
          recentSymptoms: null,
        },
      }),
    });
    if (!resp.ok || !resp.body) return "";

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";

    const paint = (text: string) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: text } : m));
        }
        return [...prev, { role: "assistant", content: text }];
      });
    };

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
            paint(assistantContent);
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    return assistantContent;
  };

  // Kick off Bella's opener once the profile is ready.
  useEffect(() => {
    if (startedRef.current) return;
    if (loading || !user || !profile) return;
    if (!profile.onboarding_completed || !profile.season || doneFlagRef.current) return;
    startedRef.current = true;

    (async () => {
      setIsStreaming(true);
      let opener = "";
      try {
        opener = await streamTurn([{ role: "user", content: buildPrime() }]);
      } catch {
        opener = "";
      }
      setIsStreaming(false);
      if (opener) {
        await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: opener });
        setPhase("awaitReply");
      } else {
        // Never strand her here: a static welcome, then the invitation.
        setMessages([
          {
            role: "assistant",
            content: `Welcome, ${displayName}. I'm Bella — I've read everything you shared, and I'm here whenever you're ready to talk.`,
          },
        ]);
        setPhase("paywall");
        markDone();
        setTimeout(() => setShowPaywall(true), 1400);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id, profile?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, showPaywall]);

  const sendReply = async (text: string) => {
    if (!text.trim() || phase !== "awaitReply" || !user) return;
    const reply = text.trim();
    setInput("");
    setPhase("replying");
    setMessages(prev => [...prev, { role: "user", content: reply }]);

    // Insert before calling the API — the server's quota counter expects the
    // current user message to already be in chat_messages. This is the one
    // free-quota message the welcome exchange spends.
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: reply });

    const priorAssistant = messages.filter(m => m.role === "assistant");
    const apiMessages = [
      { role: "user", content: buildPrime() },
      ...priorAssistant.map(m => ({ role: "assistant", content: m.content })),
      { role: "user", content: reply },
    ];

    setIsStreaming(true);
    let response = "";
    try {
      response = await streamTurn(apiMessages);
    } catch {
      response = "";
    }
    setIsStreaming(false);
    if (response) {
      await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: response });
    } else {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `I want to give that the answer it deserves, ${displayName} — find me in Ask Bella anytime.` },
      ]);
    }
    setPhase("paywall");
    markDone();
    setTimeout(() => setShowPaywall(true), 1200);
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  if (!profile) return null;
  if (!profile.season || doneFlagRef.current) return <Navigate to="/" replace />;

  return (
    <SceneBackground scene="ask">
      <div
        style={{
          maxWidth: 430,
          margin: "0 auto",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "clip",
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 18px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BellaOrb size={34} />
            <div>
              <p className="gh-brand" style={{ fontSize: 19, lineHeight: 1.1 }}>Bella</p>
              <p className="gh-brand-tag" style={{ fontSize: 9.5, marginTop: 2 }}>already knows your season</p>
            </div>
          </div>
          <button
            onClick={finishToHome}
            style={{
              background: "none",
              border: "none",
              color: "rgba(251,238,224,0.55)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: "8px 4px",
            }}
          >
            Skip for now
          </button>
        </div>

        {/* Conversation */}
        <div
          className="hide-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((msg, i) => (
            <div key={i} style={{ animation: "fadeInUp 280ms ease both" }}>
              {msg.role === "assistant" ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <BellaOrb size={26} style={{ marginTop: 4 }} />
                  <div className="mr-auto" style={{ maxWidth: "85%" }}>
                    <div
                      className="gh-glass-dark px-4 py-3 text-[14px] leading-[1.65]"
                      style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui" }}
                    >
                      <div className={markdownStyles} style={{ color: "var(--cream)" }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
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
                      {msg.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <BellaOrb size={26} style={{ marginTop: 4 }} />
              <div
                className="gh-glass-dark"
                style={{ padding: "10px 14px", display: "inline-flex", gap: 5, alignItems: "center", alignSelf: "flex-start" }}
              >
                {[0, 0.15, 0.3].map(d => (
                  <span
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--gold)",
                      animation: `typingBounce 1.2s infinite ${d}s`,
                      display: "inline-block",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {phase === "paywall" && !showPaywall && (
            <div style={{ textAlign: "center", padding: "6px 0", animation: "fadeInUp 300ms ease both" }}>
              <button
                onClick={() => setShowPaywall(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(251,238,224,0.55)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Continue
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar — one free reply */}
        {(phase === "awaitReply" || phase === "replying") && (
          <div
            style={{
              flexShrink: 0,
              padding: "10px 16px calc(14px + env(safe-area-inset-bottom))",
              background: "rgba(10,6,16,0.4)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 18,
                padding: "6px 6px 6px 14px",
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply(input)}
                placeholder="Tell Bella more…"
                disabled={phase !== "awaitReply"}
                className="flex-1 outline-none bg-transparent"
                style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui", fontSize: 14, border: "none" }}
              />
              <button
                onClick={() => sendReply(input)}
                disabled={!input.trim() || phase !== "awaitReply"}
                className="shrink-0 flex items-center justify-center gh-arrow-btn"
                style={{
                  width: 36,
                  height: 36,
                  opacity: !input.trim() || phase !== "awaitReply" ? 0.5 : 1,
                  cursor: !input.trim() || phase !== "awaitReply" ? "not-allowed" : "pointer",
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <WelcomePaywall open={showPaywall} onClose={finishToHome} />
    </SceneBackground>
  );
};

export default Welcome;
