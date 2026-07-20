import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { coursesData, Course } from "@/data/coursesData";
import { homeopathyCourses } from "@/data/shopData";
import { getLessonContent, LessonContent, getLessonDescription } from "@/data/lessonContent";
import { getHomeopathyLessonContent } from "@/data/homeopathyLessons";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ChevronRight, Check, ArrowLeft, Save, BookOpen, Leaf, Baby, GraduationCap, Lightbulb, Sparkles, CheckCircle2, Play, Droplets } from "lucide-react";
import { toast } from "sonner";
import { PremiumModal } from "@/components/PremiumModal";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";

const FILTER_TABS = ["All", "Trimester", "Wellness", "Birth prep", "Homeopathy"];
const CATEGORY_MAP: Record<string, string> = {
  Trimester: "Your trimester",
  Wellness: "Natural wellness",
  "Birth prep": "Birth preparation",
  Homeopathy: "Homeopathy",
};

// --- Unified course library: pregnancy courses + homeopathy courses ---
export const allCourses: Course[] = [
  ...coursesData,
  ...homeopathyCourses.map((h): Course => ({
    id: h.id,
    title: h.title,
    category: "Homeopathy",
    lessonCount: h.lessonCount,
    isPremium: h.isPremium,
    description: h.description,
    emoji: h.emoji,
    duration: h.duration,
    tags: h.tags,
  })),
];

const isHomeopathyCourse = (courseId: string) => courseId.startsWith("h");

export function getCourseLessonContent(courseId: string, lessonIndex: number): LessonContent {
  return isHomeopathyCourse(courseId)
    ? getHomeopathyLessonContent(courseId, lessonIndex)
    : getLessonContent(courseId, lessonIndex);
}

export function getCourseLessonDescription(courseId: string, lessonIndex: number): string {
  if (isHomeopathyCourse(courseId)) {
    const content = getHomeopathyLessonContent(courseId, lessonIndex);
    return content.description || content.intro.split(".").slice(0, 2).join(".") + ".";
  }
  return getLessonDescription(courseId, lessonIndex);
}

/** Count a course's completed lessons ("c1-" prefix match avoids c1 matching c11 ids). */
export const courseCompletionCount = (completions: string[], courseId: string) =>
  completions.filter(id => id.startsWith(`${courseId}-`)).length;

const CREAM_70 = "rgba(251,238,224,0.7)";
const CREAM_55 = "rgba(251,238,224,0.55)";
const CTA_GRADIENT = "linear-gradient(135deg, var(--gold), var(--ember))";

export function CategoryIcon({ category, size = 22 }: { category: string; size?: number }) {
  const props = { size, strokeWidth: 1.8, style: { color: "var(--gold)" } };
  if (category === "Your trimester") return <BookOpen {...props} />;
  if (category === "Natural wellness") return <Leaf {...props} />;
  if (category === "Birth preparation") return <Baby {...props} />;
  if (category === "Homeopathy") return <Droplets {...props} />;
  return <GraduationCap {...props} />;
}

const Courses = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [completions, setCompletions] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const handleSelectCourse = (id: string) => {
    const c = allCourses.find(x => x.id === id);
    if (c?.isPremium && !profile?.is_premium) { setShowPremium(true); return; }
    setSelectedCourse(id);
  };

  // Open a course/lesson passed via navigation state (e.g. from the /learn hub).
  const navState = location.state as { courseId?: string; lessonIndex?: number; from?: string } | null;
  const cameFromLearn = navState?.from === "learn";
  useEffect(() => {
    if (!navState?.courseId) return;
    const c = allCourses.find(x => x.id === navState.courseId);
    if (!c) return;
    if (c.isPremium && !profile?.is_premium) { setShowPremium(true); return; }
    setSelectedCourse(c.id);
    if (typeof navState.lessonIndex === "number") {
      setSelectedLesson(Math.max(0, Math.min(c.lessonCount - 1, navState.lessonIndex)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const exitCourseList = () => {
    if (cameFromLearn) navigate("/learn");
    else setSelectedCourse(null);
  };

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("lesson_completions").select("lesson_id").eq("user_id", user.id)
      .then(({ data }) => setCompletions(data?.map(d => d.lesson_id) || []));
  }, [user?.id]);

  const totalLessons = allCourses.reduce((s, c) => s + c.lessonCount, 0);
  const completedCount = completions.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const totalHours = Math.round(allCourses.reduce((s, c) => s + c.duration, 0) / 60);
  const completedHours = totalHours > 0 ? Math.max(0, totalHours - Math.round((totalLessons - completedCount) * 7 / 60)) : 0;
  const hoursLeft = totalHours - completedHours;

  const completeLesson = async (lessonId: string) => {
    if (!user || completions.includes(lessonId)) return;
    await supabase.from("lesson_completions").insert({ user_id: user.id, lesson_id: lessonId });
    setCompletions(prev => [...prev, lessonId]);
  };

  const saveReflection = useCallback(async (lessonId: string, text: string) => {
    if (!user || !text.trim()) return;
    await supabase.from("lesson_reflections" as any).upsert({ user_id: user.id, lesson_id: lessonId, reflection_text: text } as any, { onConflict: "user_id,lesson_id" } as any);
  }, [user]);

  const saveQuizAttempt = async (lessonId: string, option: string, correct: boolean) => {
    if (!user) return;
    await supabase.from("quiz_attempts" as any).insert({ user_id: user.id, lesson_id: lessonId, selected_option: option, is_correct: correct } as any);
  };

  const completeCourse = async (courseId: string, lessonsCount: number) => {
    if (!user) return;
    await supabase.from("course_completions" as any).insert({ user_id: user.id, course_id: courseId, lessons_count: lessonsCount } as any);
  };

  const filteredCourses = activeFilter === "All" ? allCourses : allCourses.filter(c => c.category === CATEGORY_MAP[activeFilter]);
  const categories = [...new Set(filteredCourses.map(c => c.category))];
  const continueCourses = allCourses.filter(c => {
    const count = courseCompletionCount(completions, c.id);
    return count > 0 && count < c.lessonCount;
  });

  // --- COURSE COMPLETION ---
  if (showCompletion && selectedCourse) {
    const course = allCourses.find(c => c.id === selectedCourse)!;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 page-enter gh-scene-ask" style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(242,182,71,0.18)", border: "1px solid rgba(242,182,71,0.45)", boxShadow: "0 0 24px rgba(242,182,71,0.35)" }}>
          <Check size={36} strokeWidth={1.8} style={{ color: "var(--gold)" }} />
        </div>
        <h1 className="font-gh-serif" style={{ fontSize: 28, fontWeight: 600, color: "var(--cream)", marginBottom: 8, textAlign: "center" }}>Course complete</h1>
        <p className="font-gh-serif" style={{ fontSize: 15, color: CREAM_70, marginBottom: 4, textAlign: "center" }}>{course.title}</p>
        <p className="font-gh-mono" style={{ fontSize: 12, color: CREAM_55, marginBottom: 10 }}>{course.lessonCount} lessons · {course.duration} min</p>
        <p className="font-gh-serif" style={{ fontSize: 15, fontStyle: "italic", color: CREAM_70, textAlign: "center", marginBottom: 32, lineHeight: 1.55 }}>
          You've taken a beautiful step on your pregnancy journey. Be proud of yourself, mama.
        </p>
        <button onClick={() => { setShowCompletion(false); setSelectedCourse(null); setSelectedLesson(null); if (cameFromLearn) navigate("/learn"); }}
          className="w-full max-w-xs h-12 text-[14px] font-bold mb-3 belly-btn-press"
          style={{ borderRadius: 14, background: CTA_GRADIENT, color: "var(--night)", border: "none" }}>
          {cameFromLearn ? "Back to Learn" : "Back to courses"}
        </button>
      </div>
    );
  }

  // --- LESSON READER ---
  if (selectedCourse && selectedLesson !== null) {
    const course = allCourses.find(c => c.id === selectedCourse)!;
    const lesson: LessonContent = getCourseLessonContent(course.id, selectedLesson);
    const lessonId = `${course.id}-L${selectedLesson + 1}`;
    const isCompleted = completions.includes(lessonId);
    const isLast = selectedLesson === course.lessonCount - 1;

    const handleComplete = async () => {
      await completeLesson(lessonId);
      if (isLast) { await completeCourse(course.id, course.lessonCount); setShowCompletion(true); }
      else { toast.success("Lesson complete"); setSelectedLesson(selectedLesson + 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }
    };

    return (
      <div className="min-h-screen page-enter gh-scene-ask" style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(10,6,16,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <button onClick={() => { setSelectedLesson(null); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
            className="flex items-center gap-1 belly-btn-press" style={{ color: "rgba(251,238,224,0.85)", fontWeight: 500, fontSize: 13, background: "transparent", border: "none" }}>
            <ArrowLeft size={15} strokeWidth={1.8} />Back
          </button>
          <p className="font-gh-serif truncate max-w-[170px]" style={{ fontWeight: 500, fontSize: 14 }}>{course.title}</p>
          <span className="font-gh-mono" style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)" }}>
            {selectedLesson + 1}/{course.lessonCount}
          </span>
        </div>
        <div className="px-5 pt-5 pb-4">
          <p className="gh-section-label" style={{ marginBottom: 6 }}>lesson {selectedLesson + 1}</p>
          <h1 className="font-gh-serif" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.2, marginBottom: 10 }}>{lesson.title}</h1>
          <span className="font-gh-mono" style={{ display: "inline-block", fontSize: 11, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 12px", marginBottom: 12 }}>{lesson.duration} min read</span>
          <div className="flex gap-1.5">
            {Array.from({ length: course.lessonCount }, (_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{
                background: i < selectedLesson ? "var(--ember)" : i === selectedLesson ? "var(--gold)" : "transparent",
                border: i > selectedLesson ? "1.5px solid rgba(251,238,224,0.35)" : "none",
                boxShadow: i === selectedLesson ? "0 0 8px rgba(242,182,71,0.7)" : "none",
              }} />
            ))}
          </div>
        </div>
        <div className="px-5 py-3 space-y-5" style={{ paddingBottom: 130 }}>
          <p style={{ fontSize: 15, lineHeight: 1.75 }}>{lesson.intro}</p>
          <div className="rounded-[14px] p-4 gh-glass-subtle">
            <p className="gh-section-label">what you'll learn</p>
            <div className="space-y-2">
              {lesson.whatYoullLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 7, flexShrink: 0, background: "var(--gold)" }} />
                  <p style={{ fontSize: 14, lineHeight: 1.55 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-gh-serif" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.25, margin: "20px 0 8px" }}>{section.heading}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(251,238,224,0.85)", marginBottom: 12 }}>{section.body}</p>
              {section.tip && (
                <div className="rounded-[12px] p-3 gh-glass-subtle">
                  <p className="flex items-center gap-1.5" style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: "var(--gold)" }}>
                    <Lightbulb size={12} strokeWidth={1.8} />Tip
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(251,238,224,0.85)", lineHeight: 1.55 }}>{section.tip}</p>
                </div>
              )}
            </div>
          ))}
          <div className="rounded-[14px] p-4 gh-glass-subtle">
            <p className="font-gh-serif flex items-center gap-1.5" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
              <Sparkles size={13} strokeWidth={1.8} style={{ color: "var(--gold)" }} />Did you know?
            </p>
            <p style={{ fontSize: 13, color: "rgba(251,238,224,0.85)", lineHeight: 1.6 }}>{lesson.didYouKnow}</p>
          </div>
          <div className="rounded-[14px] p-4 gh-glass-subtle">
            <p className="gh-section-label">reflect</p>
            <p className="font-gh-serif" style={{ fontStyle: "italic", fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>{lesson.reflection}</p>
            <textarea value={reflectionText} onChange={e => { setReflectionText(e.target.value); setReflectionSaved(false); }}
              placeholder="Write your thoughts..." className="w-full rounded-[10px] p-3 resize-none min-h-[80px] outline-none"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "var(--cream)", fontSize: 13, fontStyle: "italic", lineHeight: 1.5 }} />
            <button disabled={!reflectionText.trim() || reflectionSaved}
              onClick={async () => { await saveReflection(lessonId, reflectionText); setReflectionSaved(true); }}
              className="mt-2 belly-btn-press"
              style={{ borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 700, background: CTA_GRADIENT, color: "var(--night)", border: "none", opacity: !reflectionText.trim() || reflectionSaved ? 0.5 : 1 }}>
              <Save size={14} strokeWidth={1.8} style={{ display: "inline", marginRight: 5, verticalAlign: "-2px" }} />Save my reflection
            </button>
            {reflectionSaved && <p style={{ fontSize: 12, color: "#7fe0d3", marginTop: 6 }}>Saved</p>}
          </div>
          <div>
            <p className="font-gh-serif flex items-center gap-1.5" style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>
              <CheckCircle2 size={15} strokeWidth={1.8} style={{ color: "var(--teal)" }} />Quick check
            </p>
            <p style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isSelected = quizAnswer === i;
                const isCorrect = i === lesson.quiz.correctIndex;
                let borderColor = "rgba(255,255,255,0.25)", bg = "rgba(255,255,255,0.12)";
                if (quizSubmitted && isSelected && isCorrect) { borderColor = "rgba(127,224,211,0.7)"; bg = "rgba(44,156,143,0.3)"; }
                if (quizSubmitted && isSelected && !isCorrect) { borderColor = "rgba(247,159,192,0.7)"; bg = "rgba(181,56,107,0.3)"; }
                if (quizSubmitted && !isSelected && isCorrect) { borderColor = "rgba(127,224,211,0.7)"; bg = "rgba(44,156,143,0.2)"; }
                return (
                  <button key={i} disabled={quizSubmitted}
                    onClick={() => { setQuizAnswer(i); setQuizSubmitted(true); saveQuizAttempt(lessonId, opt, isCorrect); }}
                    className="w-full text-left rounded-[12px] p-3 transition-all belly-card-interactive"
                    style={{ background: bg, border: `1px solid ${borderColor}`, color: "var(--cream)", fontSize: 13 }}>
                    {opt}{quizSubmitted && isCorrect && (
                      <Check size={13} strokeWidth={2} style={{ display: "inline", marginLeft: 6, verticalAlign: "-2px", color: "#7fe0d3" }} />
                    )}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div className="mt-3 rounded-[12px] p-3 gh-glass-subtle">
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{quizAnswer === lesson.quiz.correctIndex ? "Well done!" : "Almost! Here's why..."}</p>
                <p style={{ fontSize: 12, color: "rgba(251,238,224,0.85)", lineHeight: 1.55 }}>{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "linear-gradient(140deg, rgba(242,182,71,0.35), rgba(232,98,46,0.35))", border: "1px solid var(--glass-border)" }}>
            <p className="gh-section-label">key takeaway</p>
            <p className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55 }}>{lesson.keyTakeaway}</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3" style={{ background: "rgba(10,6,16,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.12)", maxWidth: 430, margin: "0 auto", zIndex: 20 }}>
          {selectedLesson > 0 && (
            <button onClick={() => { setSelectedLesson(selectedLesson - 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
              className="h-11 px-4 flex items-center gap-1 belly-btn-press"
              style={{ borderRadius: 12, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.14)", color: "var(--cream)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <ArrowLeft size={14} strokeWidth={1.8} />Previous
            </button>
          )}
          <button onClick={handleComplete} disabled={isCompleted}
            className="flex-1 h-11 belly-btn-press"
            style={{ borderRadius: 12, fontSize: 14, fontWeight: 700, background: CTA_GRADIENT, color: "var(--night)", border: "none", opacity: isCompleted ? 0.6 : 1 }}>
            {isCompleted ? "Completed" : isLast ? "Complete course" : "Complete & continue"}
          </button>
        </div>
      </div>
    );
  }

  // --- LESSON LIST ---
  if (selectedCourse) {
    const course = allCourses.find(c => c.id === selectedCourse)!;
    const lessons = Array.from({ length: course.lessonCount }, (_, i) => ({
      id: `${course.id}-L${i + 1}`, number: i + 1,
      title: getCourseLessonContent(course.id, i).title,
      duration: getCourseLessonContent(course.id, i).duration,
      description: getCourseLessonDescription(course.id, i),
    }));
    const courseCompletions = courseCompletionCount(completions, course.id);
    const courseProgress = courseCompletions / course.lessonCount;

    return (
      <div className="min-h-screen page-enter gh-scene-ask" style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui", paddingBottom: 104 }}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <button onClick={exitCourseList} className="flex items-center gap-1 belly-btn-press"
            style={{ color: "rgba(251,238,224,0.85)", fontWeight: 500, fontSize: 13, background: "transparent", border: "none" }}>
            <ArrowLeft size={15} strokeWidth={1.8} />Back
          </button>
        </div>

        {/* Course hero card */}
        <div className="mx-4 mt-3 gh-glass" style={{ padding: "16px 16px 18px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", right: -20, top: -20, width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,182,71,0.3), transparent 70%)", pointerEvents: "none" }} />
          <div className="w-11 h-11 rounded-[13px] flex items-center justify-center mb-2.5" style={{ background: "rgba(242,182,71,0.16)", border: "1px solid rgba(242,182,71,0.35)" }}>
            <CategoryIcon category={course.category} />
          </div>
          <p className="font-gh-serif" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.25, marginBottom: 4 }}>{course.title}</p>
          <p style={{ fontSize: 12.5, color: CREAM_70, lineHeight: 1.55, marginBottom: 10 }}>{course.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {[`${course.lessonCount} lessons`, `${course.duration} min total`, course.isPremium ? "Premium" : "Free"].map(label => (
              <span key={label} className="font-gh-mono" style={{
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999, padding: "3px 10px", fontSize: 10, color: "rgba(251,238,224,0.85)",
              }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4 pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="gh-section-label" style={{ marginBottom: 0 }}>your progress</p>
            <p className="font-gh-mono" style={{ fontSize: 11, color: CREAM_70 }}>{courseCompletions} of {course.lessonCount} lessons</p>
          </div>
          <div className="gh-progress-track">
            <div className="gh-progress-fill" style={{ width: `${courseProgress * 100}%`, transition: "width 300ms ease" }} />
          </div>
        </div>

        {/* Lesson rows */}
        <div className="px-4 py-3 space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            const isNext = !completed && i === courseCompletions;
            return (
              <button key={lesson.id}
                onClick={() => { setSelectedLesson(i); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
                className="w-full text-left gh-glass-subtle belly-card-interactive"
                style={{
                  padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12,
                  border: isNext ? "1px solid rgba(242,182,71,0.6)" : undefined,
                  boxShadow: isNext ? "0 0 14px rgba(242,182,71,0.22)" : undefined,
                }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  background: completed ? "rgba(44,156,143,0.25)" : isNext ? "rgba(242,182,71,0.2)" : "rgba(255,255,255,0.1)",
                  border: completed ? "1px solid rgba(127,224,211,0.5)" : isNext ? "1px solid rgba(242,182,71,0.6)" : "1px solid rgba(255,255,255,0.18)",
                }}>
                  {completed
                    ? <Check size={14} strokeWidth={2} style={{ color: "#7fe0d3" }} />
                    : isNext
                    ? <Play size={12} strokeWidth={1.8} style={{ color: "var(--gold)", marginLeft: 2 }} />
                    : <span className="font-gh-mono" style={{ fontSize: 11, color: CREAM_55 }}>{lesson.number}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-gh-serif" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, color: "var(--cream)" }}>{lesson.title}</p>
                  <p className="line-clamp-2" style={{ fontSize: 11.5, color: CREAM_55, lineHeight: 1.5, marginTop: 2 }}>{lesson.description}</p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className="font-gh-mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: CREAM_55 }}>{lesson.duration} min</span>
                    {completed && <span className="font-gh-mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7fe0d3" }}>Complete</span>}
                    {isNext && <span className="font-gh-mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)" }}>Up next</span>}
                  </div>
                </div>
                <ChevronRight size={15} strokeWidth={1.8} style={{ color: CREAM_55, flexShrink: 0, marginTop: 6 }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- MAIN COURSE LIST ---
  return (
    <SceneBackground scene="ask">
      <div className="page-enter" style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui", paddingBottom: 104 }}>
        <GhHeader brand="Courses" tag="learn with bella" brandSize={20} />

        {/* Overall progress hero */}
        <div className="mx-4 mb-4 gh-glass" style={{ padding: "16px 16px 18px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,182,71,0.28), transparent 70%)", pointerEvents: "none" }} />
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={14} strokeWidth={1.8} style={{ color: "var(--gold)" }} />
            <p className="gh-section-label" style={{ marginBottom: 0 }}>your progress</p>
          </div>
          <p className="font-gh-serif" style={{ fontSize: 18, fontWeight: 500, marginBottom: 10 }}>{completedCount} of {totalLessons} lessons completed</p>
          <div className="gh-progress-track mb-3">
            <div className="gh-progress-fill" style={{ width: `${progressPercent}%`, transition: "width 300ms ease" }} />
          </div>
          <div className="flex gap-2">
            {[`${progressPercent}% complete`, `~${hoursLeft}h left`].map(label => (
              <span key={label} className="font-gh-mono" style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(251,238,224,0.85)" }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-5 mb-4 overflow-x-auto hide-scrollbar">
          {FILTER_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveFilter(tab)}
              className={`gh-pill whitespace-nowrap belly-btn-press ${activeFilter === tab ? "gh-pill-filled" : ""}`}
              style={{ fontSize: 12, padding: "7px 14px", background: activeFilter === tab ? undefined : "rgba(255,255,255,0.08)" }}>
              {tab}
            </button>
          ))}
        </div>

        {activeFilter === "All" && continueCourses.length > 0 && (
          <div className="mb-2">
            <p className="gh-section-label px-5 pt-2 pb-2" style={{ marginBottom: 0 }}>continue learning</p>
            <div className="px-4 space-y-2">
              {continueCourses.map(course => <CourseCard key={course.id} course={course} completions={completions} profile={profile} onSelect={handleSelectCourse} />)}
            </div>
          </div>
        )}
        {categories.map(category => (
          <div key={category} className="mb-2">
            <p className="gh-section-label px-5 pt-4 pb-2" style={{ marginBottom: 0 }}>{category.toLowerCase()}</p>
            <div className="px-4 space-y-2">
              {filteredCourses.filter(c => c.category === category).map(course => (
                <CourseCard key={course.id} course={course} completions={completions} profile={profile} onSelect={handleSelectCourse} />
              ))}
            </div>
          </div>
        ))}
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </div>
    </SceneBackground>
  );
};

function CourseCard({ course, completions, profile, onSelect }: { course: Course; completions: string[]; profile: any; onSelect: (id: string) => void }) {
  const isLocked = course.isPremium && !profile?.is_premium;
  const courseCompletions = courseCompletionCount(completions, course.id);
  const progress = courseCompletions / course.lessonCount;

  return (
    <button onClick={() => onSelect(course.id)}
      className="w-full text-left gh-glass belly-card-interactive"
      style={{
        padding: 0,
        border: isLocked ? "1px solid rgba(242,182,71,0.35)" : undefined,
        background: isLocked ? "linear-gradient(140deg, rgba(242,182,71,0.1), rgba(255,255,255,0.06))" : undefined,
      }}>
      <div className="flex items-start gap-3" style={{ padding: "14px 16px 10px" }}>
        <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0" style={{
          background: isLocked ? "rgba(242,182,71,0.14)" : "rgba(255,255,255,0.1)",
          border: isLocked ? "1px solid rgba(242,182,71,0.4)" : "1px solid rgba(255,255,255,0.16)",
        }}>
          {isLocked
            ? <Lock size={20} strokeWidth={1.8} style={{ color: "var(--gold)" }} />
            : <CategoryIcon category={course.category} size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-gh-mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(251,238,224,0.55)" }}>{course.category}</p>
          <p className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3, color: "var(--cream)" }}>{course.title}</p>
          <p style={{ fontSize: 11, color: "rgba(251,238,224,0.55)", marginTop: 2 }}>{course.lessonCount} lessons · {course.duration} min</p>
        </div>
        <span className="shrink-0 mt-1.5">
          {isLocked ? (
            <span className="flex items-center gap-1 font-gh-mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: "rgba(242,182,71,0.16)", border: "1px solid rgba(242,182,71,0.45)", color: "var(--gold)" }}>
              <Lock size={10} strokeWidth={1.8} />Premium
            </span>
          ) : (
            <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>
              {courseCompletions > 0 ? "Continue" : "Start"}<ChevronRight size={13} strokeWidth={1.8} />
            </span>
          )}
        </span>
      </div>
      {courseCompletions > 0 && !isLocked && (
        <div className="px-4 pb-2">
          <div className="gh-progress-track">
            <div className="gh-progress-fill" style={{ width: `${progress * 100}%`, transition: "width 300ms ease" }} />
          </div>
          <p className="font-gh-mono" style={{ fontSize: 10, marginTop: 5, color: "rgba(251,238,224,0.55)" }}>{courseCompletions} of {course.lessonCount} lessons · {Math.round(progress * 100)}% complete</p>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3.5" style={{ opacity: isLocked ? 0.55 : 1 }}>
        {course.tags.map(tag => (
          <span key={tag} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 999, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(251,238,224,0.7)" }}>{tag}</span>
        ))}
      </div>
    </button>
  );
}

export default Courses;
