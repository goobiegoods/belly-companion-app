import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { Course } from "@/data/coursesData";
import { allCourses, getCourseLessonContent, courseCompletionCount, CategoryIcon } from "./Courses";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";
import { PremiumModal } from "@/components/PremiumModal";
import { Lock, ChevronRight, Play, GraduationCap, Sparkles, CheckCircle2 } from "lucide-react";

const CREAM_70 = "rgba(251,238,224,0.7)";
const CREAM_55 = "rgba(251,238,224,0.55)";
const CTA_GRADIENT = "linear-gradient(135deg, var(--gold), var(--ember))";

/** Subtle accent glow: soft box-shadow + faint 1px border tint (HomePage pattern). */
const glow = (r: number, g: number, b: number): React.CSSProperties => ({
  boxShadow: `0 0 24px -6px rgba(${r},${g},${b},0.35)`,
  border: `1px solid rgba(${r},${g},${b},0.38)`,
});
const GOLD_GLOW = glow(242, 182, 71);
const TEAL_GLOW = glow(44, 156, 143);

/** Which trimesters each course is most relevant to (derived from course topics). */
const COURSE_TRIMESTERS: Record<string, (1 | 2 | 3)[]> = {
  c1: [1], c2: [1], c3: [2], c4: [3],
  c5: [1, 2, 3], c6: [1, 2, 3], c7: [2, 3], c8: [1, 2, 3],
  c9: [2, 3], c10: [3], c11: [3], c12: [3],
  h1: [1, 2, 3], h2: [1], h3: [1, 2, 3], h4: [3], h5: [2, 3],
};

interface CompletionRow {
  lesson_id: string;
  completed_at: string;
}

const Learn = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [completionRows, setCompletionRows] = useState<CompletionRow[]>([]);
  const [showPremium, setShowPremium] = useState(false);

  // Same lesson_completions pattern (and lesson ids) that Courses.tsx uses.
  useEffect(() => {
    if (!user?.id) return;
    supabase.from("lesson_completions").select("lesson_id, completed_at").eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .then(({ data }) => setCompletionRows((data as CompletionRow[]) || []));
  }, [user?.id]);

  const completions = useMemo(() => completionRows.map(r => r.lesson_id), [completionRows]);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const trimester = getWeekData(currentWeek).trimester;

  const totalLessons = allCourses.reduce((s, c) => s + c.lessonCount, 0);
  const completedCount = completions.length;

  /** First not-yet-completed lesson index of a course. */
  const nextLessonIndex = (course: Course) => {
    for (let i = 0; i < course.lessonCount; i++) {
      if (!completions.includes(`${course.id}-L${i + 1}`)) return i;
    }
    return course.lessonCount - 1;
  };

  // Most recently touched in-progress course (rows are sorted by completed_at desc).
  const continueTarget = useMemo(() => {
    for (const row of completionRows) {
      const courseId = row.lesson_id.split("-L")[0];
      const course = allCourses.find(c => c.id === courseId);
      if (!course) continue;
      const done = courseCompletionCount(completions, courseId);
      if (done > 0 && done < course.lessonCount) return course;
    }
    return null;
  }, [completionRows, completions]);

  const recommended = useMemo(() => {
    return allCourses
      .filter(c => COURSE_TRIMESTERS[c.id]?.includes(trimester))
      .filter(c => courseCompletionCount(completions, c.id) < c.lessonCount)
      .slice(0, 4);
  }, [trimester, completions]);

  // Same premium gating as Courses.tsx: Lock icons + PremiumModal, nothing more.
  const openCourse = (course: Course, lessonIndex?: number) => {
    if (course.isPremium && !profile?.is_premium) { setShowPremium(true); return; }
    navigate("/courses", { state: { courseId: course.id, lessonIndex, from: "learn" } });
  };

  const categories = [...new Set(allCourses.map(c => c.category))];

  return (
    <SceneBackground scene="ask">
      <div className="page-enter" style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui", paddingBottom: 104 }}>
        <GhHeader brand="Learn" tag="bite-size lessons" brandSize={20} showLearn={false} weekPill={`week ${currentWeek}`} />

        {/* Overall stats strip */}
        <div className="mx-4 mb-4 flex items-center gap-2 px-1">
          <GraduationCap size={13} strokeWidth={1.8} style={{ color: "var(--gold)" }} />
          <p className="font-gh-mono" style={{ fontSize: 11, color: CREAM_70 }}>
            {allCourses.length} courses · {totalLessons} lessons · {completedCount} completed
          </p>
        </div>

        {/* Continue where you left off */}
        {continueTarget && (() => {
          const done = courseCompletionCount(completions, continueTarget.id);
          const progress = done / continueTarget.lessonCount;
          const nextIdx = nextLessonIndex(continueTarget);
          const nextLesson = getCourseLessonContent(continueTarget.id, nextIdx);
          return (
            <div className="mx-4">
              <p className="gh-section-label px-1 pb-2" style={{ marginBottom: 0 }}>continue where you left off</p>
              <GlassCard onClick={() => openCourse(continueTarget, nextIdx)} style={{ ...GOLD_GLOW, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: "rgba(242,182,71,0.16)", border: "1px solid rgba(242,182,71,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CategoryIcon category={continueTarget.category} size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{continueTarget.title}</p>
                    <p style={{ fontSize: 11.5, color: CREAM_55, marginTop: 2 }}>
                      Up next: lesson {nextIdx + 1} · {nextLesson.title}
                    </p>
                  </div>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                    background: CTA_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 14px rgba(242,182,71,0.4)",
                  }}>
                    <Play size={14} strokeWidth={2} style={{ color: "var(--night)", marginLeft: 2 }} />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="gh-progress-track">
                    <div className="gh-progress-fill" style={{ width: `${progress * 100}%`, transition: "width 300ms ease" }} />
                  </div>
                  <p className="font-gh-mono" style={{ fontSize: 10, marginTop: 5, color: CREAM_55 }}>
                    {done} of {continueTarget.lessonCount} lessons · {Math.round(progress * 100)}% complete
                  </p>
                </div>
              </GlassCard>
            </div>
          );
        })()}

        {/* Recommended for this week */}
        {recommended.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 px-5 pt-2 pb-2">
              <Sparkles size={12} strokeWidth={1.8} style={{ color: "var(--teal)" }} />
              <p className="gh-section-label" style={{ marginBottom: 0 }}>recommended for week {currentWeek}</p>
            </div>
            <div className="flex gap-2.5 px-4 overflow-x-auto hide-scrollbar" style={{ paddingBottom: 6 }}>
              {recommended.map(course => {
                const isLocked = course.isPremium && !profile?.is_premium;
                const done = courseCompletionCount(completions, course.id);
                return (
                  <button key={course.id} onClick={() => openCourse(course)}
                    className="gh-glass-subtle belly-card-interactive text-left"
                    style={{ ...TEAL_GLOW, flexShrink: 0, width: 168, padding: "13px 13px 14px", cursor: "pointer" }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 11,
                        background: "rgba(44,156,143,0.18)", border: "1px solid rgba(44,156,143,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CategoryIcon category={course.category} size={16} />
                      </div>
                      {isLocked && <Lock size={13} strokeWidth={1.8} style={{ color: "var(--gold)" }} />}
                    </div>
                    <p className="font-gh-serif line-clamp-2" style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.3, color: "var(--cream)" }}>{course.title}</p>
                    <p className="font-gh-mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: CREAM_55, marginTop: 5 }}>
                      {done > 0 ? `${done}/${course.lessonCount} lessons` : `${course.lessonCount} lessons · ${course.duration} min`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Full course library */}
        {categories.map(category => (
          <div key={category} className="mb-2">
            <p className="gh-section-label px-5 pt-4 pb-2" style={{ marginBottom: 0 }}>{category.toLowerCase()}</p>
            <div className="px-4 space-y-2">
              {allCourses.filter(c => c.category === category).map(course => {
                const isLocked = course.isPremium && !profile?.is_premium;
                const done = courseCompletionCount(completions, course.id);
                const progress = done / course.lessonCount;
                const finished = done >= course.lessonCount;
                return (
                  <button key={course.id} onClick={() => openCourse(course)}
                    className="w-full text-left gh-glass belly-card-interactive"
                    style={{
                      padding: "13px 14px",
                      border: isLocked ? "1px solid rgba(242,182,71,0.35)" : undefined,
                      background: isLocked ? "linear-gradient(140deg, rgba(242,182,71,0.1), rgba(255,255,255,0.06))" : undefined,
                    }}>
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: isLocked ? "rgba(242,182,71,0.14)" : "rgba(255,255,255,0.1)",
                        border: isLocked ? "1px solid rgba(242,182,71,0.4)" : "1px solid rgba(255,255,255,0.16)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isLocked
                          ? <Lock size={18} strokeWidth={1.8} style={{ color: "var(--gold)" }} />
                          : <CategoryIcon category={course.category} size={18} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="font-gh-serif truncate" style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.3, color: "var(--cream)" }}>{course.title}</p>
                        <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
                          <span className="font-gh-mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: CREAM_55 }}>
                            {course.lessonCount} lessons
                          </span>
                          {finished && (
                            <span className="flex items-center gap-1 font-gh-mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7fe0d3" }}>
                              <CheckCircle2 size={10} strokeWidth={2} />Done
                            </span>
                          )}
                          {isLocked && (
                            <span className="font-gh-mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)" }}>Premium</span>
                          )}
                        </div>
                        {done > 0 && !finished && !isLocked && (
                          <div style={{ marginTop: 7, maxWidth: 200 }}>
                            <div className="gh-progress-track">
                              <div className="gh-progress-fill" style={{ width: `${progress * 100}%`, transition: "width 300ms ease" }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={15} strokeWidth={1.8} style={{ color: CREAM_55, flexShrink: 0 }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </div>
    </SceneBackground>
  );
};

export default Learn;
