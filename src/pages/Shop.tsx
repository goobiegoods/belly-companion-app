import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { kits, remedies, teas, homeopathyCourses, SHOP_DISCLAIMER, Product } from "@/data/shopData";
import { getHomeopathyLessonContent } from "@/data/homeopathyLessons";
import { LessonContent } from "@/data/lessonContent";
import { X, Plus, Minus, Check, ChevronRight, Lock, Save } from "lucide-react";
import { toast } from "sonner";

interface CartItem { product: Product; qty: number }

const Shop = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<"remedies" | "learn">("remedies");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [completions, setCompletions] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(6);
    toast.success(`${product.name} added 🛍️`);
    setTimeout(() => setShowCart(true), 800);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const placeOrder = async () => {
    if (!user || cart.length === 0) return;
    setOrdering(true);
    const items = cart.map(i => ({ id: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price }));
    await supabase.from("orders" as any).insert({ user_id: user.id, items, total: cartTotal, status: "pending" } as any);
    setCart([]); setShowCart(false); setOrdering(false);
    toast.success("Order received! 🌸 We'll be in touch within 24 hours with shipping details.");
  };

  const saveReflection = useCallback(async (lessonId: string, text: string) => {
    if (!user || !text.trim()) return;
    await supabase.from("lesson_reflections" as any).upsert({ user_id: user.id, lesson_id: lessonId, reflection_text: text } as any, { onConflict: "user_id,lesson_id" } as any);
  }, [user]);

  const completeLesson = async (lessonId: string) => {
    if (!user || completions.includes(lessonId)) return;
    await supabase.from("lesson_completions").insert({ user_id: user.id, lesson_id: lessonId });
    setCompletions(prev => [...prev, lessonId]);
  };

  // --- LESSON READER ---
  if (selectedCourse && selectedLesson !== null) {
    const course = homeopathyCourses.find(c => c.id === selectedCourse)!;
    const lesson: LessonContent = getHomeopathyLessonContent(course.id, selectedLesson);
    const lessonId = `${course.id}-L${selectedLesson + 1}`;
    const isCompleted = completions.includes(lessonId);
    const isLast = selectedLesson === course.lessonCount - 1;

    const handleComplete = async () => {
      await completeLesson(lessonId);
      if (isLast) { toast.success("Course complete! 🌸"); setSelectedCourse(null); setSelectedLesson(null); }
      else { toast.success("Lesson complete! ✓"); setSelectedLesson(selectedLesson + 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }
    };

    return (
      <div className="min-h-screen flex flex-col page-enter" style={{ background: "transparent" }}>
        <div className="flex items-center justify-between px-4 py-3 belly-glass-nav" style={{ borderBottom: "0.5px solid rgba(255,170,130,0.18)" }}>
          <button onClick={() => { setSelectedLesson(null); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
            className="text-[12px] font-semibold" style={{ color: "#C4906A" }}>← Back</button>
          <p className="text-[13px] font-semibold truncate max-w-[180px]" style={{ color: "#A84E28" }}>{course.title}</p>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(255,200,170,0.25)", color: "#D4906A" }}>{selectedLesson + 1}/{course.lessonCount}</span>
        </div>
        <div className="px-5 pt-5 pb-6 belly-hero-gradient">
          <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>LESSON {selectedLesson + 1}</p>
          <h1 className="font-display text-[22px] font-semibold mb-3" style={{ color: "#FFF9F6" }}>{lesson.title}</h1>
          <span className="inline-block text-[11px] px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)", color: "#FFF9F6" }}>{lesson.duration} min read</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
          <p className="font-display text-[15px] leading-[1.75]" style={{ color: "#C4906A" }}>{lesson.intro}</p>
          <div className="rounded-r-[12px] p-4" style={{ background: "rgba(255,244,238,0.9)", borderLeft: "3px solid #FFB899" }}>
            <p className="text-[10px] uppercase tracking-[0.11em] mb-2 font-semibold" style={{ color: "rgba(200,88,40,0.4)" }}>What you'll learn</p>
            <div className="space-y-2">
              {lesson.whatYoullLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#FFB899" }} />
                  <p className="text-[13px]" style={{ color: "#A84E28" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-display text-[16px] font-semibold mb-2" style={{ color: "#A84E28" }}>{section.heading}</h2>
              <p className="text-[13px] leading-[1.75] mb-3" style={{ color: "#C4906A" }}>{section.body}</p>
              {section.tip && (
                <div className="rounded-[12px] p-3" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "#E07040" }}>💡 Tip:</p>
                  <p className="text-[12px]" style={{ color: "#C4906A" }}>{section.tip}</p>
                </div>
              )}
            </div>
          ))}
          <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
            <p className="font-display text-[13px] font-semibold mb-1" style={{ color: "#A84E28" }}>Did you know? 🌸</p>
            <p className="text-[12px]" style={{ color: "#C4906A" }}>{lesson.didYouKnow}</p>
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
            <p className="text-[10px] uppercase tracking-[0.11em] mb-2 font-semibold" style={{ color: "rgba(200,88,40,0.4)" }}>Reflect 💭</p>
            <p className="font-display text-[14px] italic mb-3" style={{ color: "#A84E28" }}>{lesson.reflection}</p>
            <textarea value={reflectionText} onChange={e => { setReflectionText(e.target.value); setReflectionSaved(false); }}
              placeholder="Write your thoughts..." className="w-full rounded-[10px] p-3 text-[13px] resize-none min-h-[80px] font-display italic belly-input-focus"
              style={{ background: "rgba(255,248,245,0.9)", border: "0.5px solid rgba(255,170,130,0.22)", color: "#A84E28" }} />
            <button disabled={!reflectionText.trim() || reflectionSaved}
              onClick={async () => { await saveReflection(lessonId, reflectionText); setReflectionSaved(true); }}
              className="mt-2 rounded-[12px] px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50 belly-btn-primary" style={{ background: "linear-gradient(135deg, #FF7840, #FFA070)", color: "white" }}>
              Save my reflection 💭
            </button>
            {reflectionSaved && <p className="text-[12px] mt-1.5" style={{ color: "#40A060" }}>Saved 🌸</p>}
          </div>
          <div>
            <p className="font-display text-[15px] font-semibold mb-3" style={{ color: "#A84E28" }}>Quick check ✓</p>
            <p className="text-[13px] mb-3" style={{ color: "#C4906A" }}>{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isSelected = quizAnswer === i;
                const isCorrect = i === lesson.quiz.correctIndex;
                let borderColor = "rgba(255,170,130,0.22)", bg = "rgba(255,255,255,0.72)";
                if (quizSubmitted && isSelected && isCorrect) { borderColor = "rgba(100,200,130,0.5)"; bg = "rgba(200,240,210,0.85)"; }
                if (quizSubmitted && isSelected && !isCorrect) { borderColor = "rgba(255,140,140,0.4)"; bg = "rgba(255,220,220,0.8)"; }
                if (quizSubmitted && !isSelected && isCorrect) { borderColor = "rgba(100,200,130,0.5)"; bg = "rgba(200,240,210,0.85)"; }
                return (
                  <button key={i} disabled={quizSubmitted} onClick={() => { setQuizAnswer(i); setQuizSubmitted(true); }}
                    className="w-full text-left rounded-[12px] p-3 text-[13px] transition-all belly-card-interactive"
                    style={{ background: bg, border: `0.5px solid ${borderColor}`, color: "#A84E28", backdropFilter: "blur(12px)" }}>
                    {opt}{quizSubmitted && isCorrect && " ✓"}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div className="mt-3 rounded-[12px] p-3" style={{ background: quizAnswer === lesson.quiz.correctIndex ? "rgba(200,240,210,0.5)" : "rgba(255,230,220,0.5)", border: `0.5px solid ${quizAnswer === lesson.quiz.correctIndex ? "rgba(100,200,130,0.3)" : "rgba(255,170,130,0.3)"}` }}>
                <p className="text-[13px] font-semibold mb-1" style={{ color: quizAnswer === lesson.quiz.correctIndex ? "#40A060" : "#E07040" }}>{quizAnswer === lesson.quiz.correctIndex ? "Well done! 🌸" : "Almost! Here's why..."}</p>
                <p className="text-[12px]" style={{ color: "#C4906A" }}>{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)", borderRadius: 14 }}>
            <p className="text-[10px] uppercase tracking-[0.11em] mb-2 font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Key takeaway</p>
            <p className="font-display text-[14px] leading-[1.6]" style={{ color: "#FFF9F6" }}>{lesson.keyTakeaway}</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3 belly-glass-nav" style={{ borderTop: "0.5px solid rgba(255,170,130,0.18)" }}>
          {selectedLesson > 0 && (
            <button onClick={() => { setSelectedLesson(selectedLesson - 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
              className="h-11 px-4 rounded-[12px] text-[13px] font-semibold belly-btn-press" style={{ background: "rgba(255,255,255,0.7)", color: "#C4906A", border: "0.5px solid rgba(255,170,130,0.3)" }}>← Previous</button>
          )}
          <button onClick={handleComplete} disabled={isCompleted}
            className="flex-1 h-11 rounded-[12px] text-[14px] font-semibold disabled:opacity-50 belly-btn-primary" style={{ background: "linear-gradient(135deg, #FF7840, #FFA070)", color: "white" }}>
            {isCompleted ? "✓ Completed" : isLast ? "Complete course 🌸" : "Complete & continue →"}
          </button>
        </div>
      </div>
    );
  }

  // --- LESSON LIST ---
  if (selectedCourse) {
    const course = homeopathyCourses.find(c => c.id === selectedCourse)!;
    const lessons = Array.from({ length: course.lessonCount }, (_, i) => ({
      id: `${course.id}-L${i + 1}`, number: i + 1,
      title: getHomeopathyLessonContent(course.id, i).title,
      duration: getHomeopathyLessonContent(course.id, i).duration,
    }));

    return (
      <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 belly-glass-nav" style={{ borderBottom: "0.5px solid rgba(255,170,130,0.18)" }}>
          <button onClick={() => setSelectedCourse(null)} className="text-[12px] font-semibold" style={{ color: "#C4906A" }}>← Back</button>
          <h1 className="font-display text-[16px] font-semibold" style={{ color: "#A84E28" }}>{course.title}</h1>
        </div>
        <div className="px-5 py-4 space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            return (
              <button key={lesson.id} onClick={() => { setSelectedLesson(i); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
                className="w-full rounded-[18px] p-4 flex items-center gap-3 text-left belly-card-interactive"
                style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: completed ? "#40A060" : "rgba(255,210,185,0.6)", color: completed ? "white" : "#E07040" }}>
                  {completed ? <Check size={14} /> : lesson.number}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: "#A84E28" }}>{lesson.title}</p>
                  <p className="text-[10px]" style={{ color: "rgba(180,100,60,0.38)" }}>{lesson.duration} min</p>
                </div>
                <ChevronRight size={16} style={{ color: "rgba(180,100,60,0.38)" }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- MAIN SHOP ---
  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <div className="px-5 pt-5 pb-1 flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.5px]" style={{ color: "#C85828" }}>Belly Shop</h1>
          <p className="text-[12px]" style={{ color: "#D4906A", fontWeight: 400 }}>Natural remedies, delivered to you</p>
        </div>
        <button onClick={() => setShowCart(true)} className="relative shrink-0 mt-1"
          style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "0.5px solid rgba(255,170,130,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 8px rgba(255,140,90,0.1)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C85828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center"
              style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(145deg, #FF7840, #FFAB80)", color: "white", fontSize: 9, fontWeight: 700, boxShadow: "0 2px 6px rgba(255,120,64,0.35)", animation: "badgePop 200ms cubic-bezier(0.34,1.56,0.64,1)" }}>
              {cartCount}
            </div>
          )}
        </button>
      </div>
      <div className="flex gap-2 px-5 my-3">
        {(["remedies", "learn"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="rounded-full px-4 py-1.5 text-[12px] capitalize transition-all belly-btn-press"
            style={{
              background: tab === t ? "linear-gradient(135deg, #FF7840, #FFA070)" : "rgba(255,255,255,0.7)",
              color: tab === t ? "white" : "#C4784A",
              fontWeight: tab === t ? 600 : 500,
              border: tab === t ? "none" : "0.5px solid rgba(255,170,130,0.3)"
            }}>{t}</button>
        ))}
      </div>

      {tab === "remedies" ? (
        <>
          <div className="mx-4 mb-4 p-5 rounded-[20px] belly-hero-gradient relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }} />
            <div className="absolute left-8 bottom-[-15px] w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
            <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>CURATED FOR PREGNANCY</p>
            <h2 className="font-display text-[20px] font-semibold mb-1" style={{ color: "#FFF9F6" }}>Natural support for every trimester</h2>
            <p className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>Homeopathic remedies + herbal teas, carefully selected for pregnancy safety</p>
            <button onClick={() => document.getElementById('remedy-kits')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-block text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.25)", color: "#FFF9F6", border: "none", cursor: "pointer" }}>Shop all →</button>
          </div>

          <p id="remedy-kits" className="px-5 text-[10px] uppercase tracking-[0.11em] mb-2 font-semibold" style={{ color: "rgba(200,88,40,0.4)" }}>Remedy kits</p>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar mb-5" style={{ paddingRight: 32 }}>
            {kits.map(kit => (
              <div key={kit.id} className="min-w-[180px] shrink-0 belly-card-interactive overflow-hidden"
                style={{ background: "rgba(255,255,255,0.75)", border: "0.5px solid rgba(255,170,130,0.2)", borderRadius: 18, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "0 4px 16px rgba(255,140,90,0.08)" }}>
                <div className="flex items-center justify-center" style={{ height: 72, background: "linear-gradient(135deg, #FF9F6B, #FFCDB4)" }}>
                  <span className="text-[32px]">{kit.emoji}</span>
                </div>
                <div className="p-3">
                  {kit.tag && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold mb-1 inline-block" style={{ background: "rgba(255,184,153,0.25)", color: "#C4622A" }}>{kit.tag}</span>}
                  <p className="font-display text-[13px] font-semibold" style={{ color: "#A84E28" }}>{kit.name}</p>
                  <p className="text-[11px] my-1" style={{ color: "#C4906A", fontWeight: 400 }}>{kit.description}</p>
                  {kit.contents?.map((c, i) => <p key={i} className="text-[10px]" style={{ color: "#D4B098" }}>{c}</p>)}
                  <p className="font-display text-[16px] font-semibold mt-2" style={{ color: "#A84E28" }}>${kit.price}</p>
                  <button onClick={() => addToCart(kit)} className="w-full mt-2 rounded-[10px] py-2 text-[11px] font-semibold belly-btn-primary" style={{ background: "linear-gradient(135deg, #FF7840, #FFA070)", color: "white" }}>Add to cart →</button>
                </div>
              </div>
            ))}
          </div>

          <p className="px-5 text-[10px] uppercase tracking-[0.11em] mb-2 font-semibold" style={{ color: "rgba(200,88,40,0.4)" }}>Individual remedies</p>
          <div className="px-5 space-y-2 mb-5">
            {remedies.map(rem => (
              <div key={rem.id} className="flex items-center gap-3 belly-card-interactive"
                style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", borderRadius: 16, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", padding: "13px 15px" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0" style={{ background: "rgba(255,210,185,0.6)" }}>{rem.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: "#A84E28" }}>{rem.name}</p>
                  {rem.brand && <p className="text-[10px]" style={{ color: "rgba(180,100,60,0.38)" }}>{rem.brand}</p>}
                  <p className="text-[11px]" style={{ color: "#C4906A", fontWeight: 400 }}>{rem.use}</p>
                  {rem.safe && <p className="text-[10px] mt-0.5" style={{ color: "#40A060" }}>✓ Pregnancy safe</p>}
                  {rem.tag && <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: "rgba(255,184,153,0.25)", color: "#C4622A" }}>{rem.tag}</span>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-[14px] font-semibold" style={{ color: "#A84E28" }}>${rem.price}</p>
                  {rem.unit && <p className="text-[9px]" style={{ color: "rgba(180,100,60,0.38)" }}>{rem.unit}</p>}
                  <button onClick={() => addToCart(rem)} className="mt-1 rounded-[16px] px-3 py-1 text-[10px] font-semibold belly-btn-primary" style={{ background: "linear-gradient(135deg, #FF7840, #FFA070)", color: "white" }}>Add</button>
                </div>
              </div>
            ))}
          </div>

          <p className="px-5 text-[10px] uppercase tracking-[0.11em] mb-2 font-semibold" style={{ color: "rgba(200,88,40,0.4)" }}>Herbal teas</p>
          <div className="px-5 space-y-2 mb-5">
            {teas.map(tea => (
              <div key={tea.id} className="flex items-center gap-3 belly-card-interactive"
                style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", borderRadius: 16, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", padding: "13px 15px" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0" style={{ background: "rgba(255,210,185,0.6)" }}>{tea.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: "#A84E28" }}>{tea.name}</p>
                  <p className="text-[11px]" style={{ color: "#C4906A", fontWeight: 400 }}>{tea.use}</p>
                  {tea.tag && <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: "rgba(255,184,153,0.25)", color: "#C4622A" }}>{tea.tag}</span>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-[14px] font-semibold" style={{ color: "#A84E28" }}>${tea.price}</p>
                  {tea.unit && <p className="text-[9px]" style={{ color: "rgba(180,100,60,0.38)" }}>{tea.unit}</p>}
                  <button onClick={() => addToCart(tea)} className="mt-1 rounded-[16px] px-3 py-1 text-[10px] font-semibold belly-btn-primary" style={{ background: "linear-gradient(135deg, #FF7840, #FFA070)", color: "white" }}>Add</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-[12px] p-3" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
            <p className="text-[10px]" style={{ color: "rgba(180,100,60,0.38)" }}>{SHOP_DISCLAIMER}</p>
          </div>
        </>
      ) : (
        <>
          <div className="mx-4 mb-4 p-5 rounded-[20px] belly-hero-gradient relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }} />
            <div className="absolute left-8 bottom-[-15px] w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
            <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>INTRO TO HOMEOPATHY</p>
            <h2 className="font-display text-[20px] font-semibold mb-1" style={{ color: "#FFF9F6" }}>Learn the gentle art of natural healing</h2>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>Evidence-informed courses on using homeopathic remedies safely during pregnancy</p>
          </div>
          <div className="px-5 space-y-3 mb-5">
            {homeopathyCourses.map(course => {
              const isLocked = course.isPremium && !profile?.is_premium;
              const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
              const progress = courseCompletions / course.lessonCount;
              return (
                <button key={course.id} onClick={() => !isLocked && setSelectedCourse(course.id)}
                  className="w-full text-left belly-card-interactive"
                  style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", borderRadius: 18, backdropFilter: "blur(12px)", opacity: isLocked ? 0.5 : 1 }}>
                  <div className="flex items-start gap-3 p-[14px_16px_10px]">
                    <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 text-[22px]" style={{ background: "rgba(255,210,185,0.6)" }}>
                      {isLocked ? <Lock size={18} style={{ color: "rgba(180,100,60,0.38)" }} /> : course.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: "#A84E28" }}>{course.title}</p>
                      <p className="text-[10.5px]" style={{ color: "rgba(180,100,60,0.38)" }}>{course.lessonCount} lessons · {course.duration} min</p>
                      <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "#C4906A", fontWeight: 400 }}>{course.description}</p>
                    </div>
                    <span className="text-[12px] font-semibold shrink-0 mt-2" style={{ color: "#C4906A" }}>
                      {isLocked ? <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(255,200,170,0.25)", border: "0.5px solid rgba(255,170,130,0.3)", color: "#D4906A" }}>🔒 Premium</span>
                        : courseCompletions > 0 ? "Continue →" : "Start →"}
                    </span>
                  </div>
                  {courseCompletions > 0 && !isLocked && (
                    <div className="px-4 pb-2">
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,240,232,0.8)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "linear-gradient(135deg, #FF7840, #FFA070)" }} />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {course.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,200,170,0.25)", border: "0.5px solid rgba(255,170,130,0.3)", color: "#D4906A" }}>{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mx-5 mb-5 rounded-[12px] p-3" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
            <p className="text-[10px]" style={{ color: "rgba(180,100,60,0.38)" }}>{SHOP_DISCLAIMER}</p>
          </div>
        </>
      )}

      {/* Cart overlay — slides from top-right */}
      {showCart && (
        <div className="fixed inset-0 z-[200]" style={{ background: "rgba(42,18,0,0.25)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} onClick={() => setShowCart(false)}>
          <div className="fixed" onClick={e => e.stopPropagation()}
            style={{
              top: 60, right: 16, width: "min(320px, calc(100vw - 32px))", maxHeight: "70vh",
              borderRadius: 20, background: "rgba(254,248,244,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: "0.5px solid rgba(255,170,130,0.25)", boxShadow: "0 16px 48px rgba(42,18,0,0.15)",
              overflow: "hidden", animation: "slideDown 220ms cubic-bezier(0.22,1,0.36,1)",
              display: "flex", flexDirection: "column",
            }}>
            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: "14px 16px 10px", borderBottom: "0.5px solid rgba(255,170,130,0.15)" }}>
              <span style={{ color: "#C85828", fontSize: 14, fontWeight: 600 }}>Your cart</span>
              <button onClick={() => setShowCart(false)} style={{ color: "#D4906A", fontSize: 18, cursor: "pointer", background: "none", border: "none" }}>×</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🛍️</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#A84E28" }}>Your cart is empty</p>
                <p style={{ fontSize: 11, color: "#D4906A", fontStyle: "italic" }}>Add a remedy to get started</p>
              </div>
            ) : (
              <>
                {/* Items */}
                <div style={{ maxHeight: 240, overflowY: "auto", padding: "8px 16px" }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid rgba(255,170,130,0.1)" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,200,170,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                        {item.product.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#A84E28" }}>{item.product.name}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <button onClick={() => updateQty(item.product.id, -1)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,210,185,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Minus size={10} style={{ color: "#E07040" }} />
                          </button>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#A84E28", width: 16, textAlign: "center" }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.product.id, 1)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,210,185,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Plus size={10} style={{ color: "#E07040" }} />
                          </button>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#A84E28" }}>${(item.product.price * item.qty).toFixed(2)}</p>
                        <button onClick={() => updateQty(item.product.id, -item.qty)} style={{ fontSize: 14, color: "rgba(180,100,60,0.4)", background: "none", border: "none", cursor: "pointer" }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ padding: "10px 16px", borderTop: "0.5px solid rgba(255,170,130,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#D4906A" }}>Subtotal</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#A84E28" }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <p style={{ fontSize: 9, fontStyle: "italic", color: "rgba(180,100,60,0.4)", textAlign: "center", marginTop: 4 }}>
                    {cartTotal >= 40 ? "✓ Free shipping included" : "Free shipping on orders over $40"}
                  </p>
                </div>

                {/* Checkout buttons */}
                <div style={{ padding: "10px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={placeOrder} disabled={ordering}
                    style={{ width: "100%", background: "linear-gradient(145deg, #FF7840, #FFAB80)", borderRadius: 14, padding: 14, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "white", boxShadow: "0 4px 14px rgba(255,120,64,0.28)", opacity: ordering ? 0.6 : 1 }}>
                    {ordering ? "Placing order..." : "Place order →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Shop;
