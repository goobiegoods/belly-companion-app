import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { toast } from "sonner";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";
import { Moon, Smile, Sparkles, Activity, CloudRain, Meh, BookOpen, type LucideIcon } from "lucide-react";

const MOODS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "tired", label: "TIRED", icon: Moon },
  { key: "good", label: "GOOD", icon: Smile },
  { key: "glowing", label: "GLOWING", icon: Sparkles },
  { key: "anxious", label: "ANXIOUS", icon: Activity },
  { key: "unwell", label: "UNWELL", icon: CloudRain },
];

const SYMPTOMS = [
  "Nausea", "Fatigue", "Back pain", "Heartburn", "Swelling",
  "Headache", "Insomnia", "Mood changes", "Cravings", "Other",
];

const moodIconFor = (m: string | null | undefined): LucideIcon =>
  MOODS.find(x => x.key === m)?.icon || Meh;
const moodLabelFor = (m: string | null | undefined) => MOODS.find(x => x.key === m)?.label || (m || "—");

const Journal = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.id) fetchEntries(); }, [user?.id]);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setEntries(data || []);
  };

  const saveEntry = async () => {
    if (!user || !selectedMood) return;
    setSaving(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id, date: today, mood: selectedMood,
      symptoms: selectedSymptoms, note: note || null, week_number: currentWeek
    });
    setSaving(false);
    if (error) { toast.error("Something went wrong. Try again."); return; }
    toast.success("Entry saved for today");
    setSelectedMood(null); setSelectedSymptoms([]); setNote("");
    fetchEntries();
  };

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const askDoulaAbout = (entry: any) => {
    const moodLabel = moodLabelFor(entry.mood).toLowerCase();
    const syms = (entry.symptoms || []).join(", ");
    const prefill = syms
      ? `I logged feeling ${moodLabel} with ${syms} this week. Can you help?`
      : `I logged feeling ${moodLabel} this week. Can you help?`;
    navigate("/ask", { state: { prefill } });
  };

  // Group entries by week (descending)
  const grouped: Record<string, any[]> = {};
  entries.forEach(e => {
    const key = e.week_number ? `WEEK ${e.week_number}` : "EARLIER";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });
  const weekKeys = Object.keys(grouped).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, "") || "0", 10);
    const nb = parseInt(b.replace(/\D/g, "") || "0", 10);
    return nb - na;
  });

  const canSave = !!selectedMood;

  return (
    <SceneBackground scene="journey">
      <GhHeader
        brand="Journal"
        tag="mood · symptoms · notes"
        brandSize={20}
        weekPill={currentWeek ? `wk ${currentWeek}` : undefined}
      />

      <div style={{ padding: "12px 18px 110px" }}>
        {/* Today's entry form */}
        <GlassCard>
          <div className="gh-section-label">how are you today</div>

          {/* Mood picker */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {MOODS.map(mood => {
              const selected = selectedMood === mood.key;
              const Icon = mood.icon;
              return (
                <button
                  key={mood.key}
                  onClick={() => setSelectedMood(mood.key)}
                  className="gh-tile belly-btn-press"
                  aria-pressed={selected}
                  style={{
                    flex: 1, minWidth: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "12px 2px 10px",
                    background: selected ? "rgba(242,182,71,0.18)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${selected ? "var(--gold)" : "rgba(255,255,255,0.18)"}`,
                    transition: "all 160ms ease",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    style={{ stroke: selected ? "var(--gold)" : "rgba(251,238,224,0.7)" }}
                  />
                  <span
                    className="font-gh-mono"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8, letterSpacing: "0.08em",
                      color: selected ? "var(--gold)" : "rgba(251,238,224,0.7)",
                    }}
                  >
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Symptoms */}
          <div className="gh-section-label">symptoms</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {SYMPTOMS.map(s => {
              const on = selectedSymptoms.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`gh-pill belly-btn-press${on ? " gh-pill-filled" : ""}`}
                  aria-pressed={on}
                  style={{ fontSize: 12, padding: "6px 13px" }}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Anything else on your mind today?"
            rows={3}
            style={{
              width: "100%", minHeight: 80, resize: "none",
              background: "rgba(0,0,0,0.18)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14, padding: 12, outline: "none",
              color: "var(--cream)",
              fontFamily: "'Inter', sans-serif", fontSize: 13,
            }}
          />

          {/* Save CTA */}
          <button
            onClick={saveEntry}
            disabled={!canSave || saving}
            className="belly-btn-press"
            style={{
              marginTop: 14, width: "100%",
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              color: "var(--night)",
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
              borderRadius: 14, padding: "13px 14px", border: "none",
              opacity: (!canSave || saving) ? 0.5 : 1,
              cursor: (!canSave || saving) ? "default" : "pointer",
              boxShadow: "0 6px 18px -6px rgba(232,98,46,0.55)",
            }}
          >
            {saving ? "Saving..." : "Save today's entry"}
          </button>
        </GlassCard>

        {/* History */}
        <div className="gh-section-label" style={{ marginTop: 6 }}>your entries</div>

        {entries.length === 0 ? (
          <div className="gh-glass-subtle" style={{ padding: "28px 16px", textAlign: "center" }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: "50%", margin: "0 auto 12px",
                background: "rgba(242,182,71,0.14)", border: "1px solid rgba(242,182,71,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <BookOpen size={20} strokeWidth={1.8} style={{ stroke: "var(--gold)" }} />
            </div>
            <p className="font-gh-serif" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: "var(--cream)", marginBottom: 4 }}>
              Your entries will appear here
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(251,238,224,0.55)" }}>
              Save your first check-in above
            </p>
          </div>
        ) : (
          weekKeys.map(weekKey => (
            <div key={weekKey} style={{ marginBottom: 18 }}>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "rgba(251,238,224,0.55)", marginBottom: 8,
                }}
              >
                {weekKey}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {grouped[weekKey].map((entry: any) => {
                  const MoodIcon = moodIconFor(entry.mood);
                  return (
                    <div key={entry.id} className="gh-glass-subtle" style={{ padding: "13px 14px" }}>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                          color: "rgba(251,238,224,0.55)", marginBottom: 7,
                        }}
                      >
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: entry.symptoms?.length || entry.note ? 8 : 6 }}>
                        <MoodIcon size={16} strokeWidth={1.8} style={{ stroke: "var(--gold)", flexShrink: 0 }} />
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
                            color: "var(--cream)", textTransform: "capitalize",
                          }}
                        >
                          {moodLabelFor(entry.mood).toLowerCase()}
                        </span>
                      </div>
                      {entry.symptoms?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: entry.note ? 8 : 6 }}>
                          {entry.symptoms.map((s: string) => (
                            <span
                              key={s}
                              style={{
                                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500,
                                padding: "3px 9px", borderRadius: 20,
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                color: "rgba(251,238,224,0.8)",
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.note && (
                        <p
                          className="font-gh-serif"
                          style={{
                            fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
                            fontSize: 13, color: "var(--cream)", opacity: 0.9,
                            marginBottom: 8, lineHeight: 1.45,
                          }}
                        >
                          {entry.note}
                        </p>
                      )}
                      <button
                        onClick={() => askDoulaAbout(entry)}
                        className="belly-btn-press"
                        style={{
                          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                          color: "var(--gold)", background: "none", border: "none",
                          padding: 0, cursor: "pointer",
                        }}
                      >
                        Ask doula about this →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </SceneBackground>
  );
};

export default Journal;
