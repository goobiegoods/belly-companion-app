import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { toast } from "sonner";

const MOODS = [
  { key: "tired", label: "TIRED", emoji: "😴" },
  { key: "good", label: "GOOD", emoji: "😊" },
  { key: "glowing", label: "GLOWING", emoji: "🥰" },
  { key: "anxious", label: "ANXIOUS", emoji: "😰" },
  { key: "unwell", label: "UNWELL", emoji: "😣" },
];

const SYMPTOMS = [
  "Nausea", "Fatigue", "Back pain", "Heartburn", "Swelling",
  "Headache", "Insomnia", "Mood changes", "Cravings", "Other",
];

const moodEmojiFor = (m: string | null | undefined) => MOODS.find(x => x.key === m)?.emoji || "😐";
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
    toast.success("✓ Entry saved for today!");
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
    <div className="flex flex-col" style={{ minHeight: "100vh", background: "transparent" }}>
      <div className="px-5 pt-5 pb-3 shrink-0" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigate("/me")} aria-label="Back"
          style={{
            width: 36, height: 36, borderRadius: 12, background: "#FFFFFF",
            border: "1px solid #F0E4DA", color: "#E8601A", fontSize: 22, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            fontWeight: 700,
          }}>‹</button>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: "white" }}>Journal</h1>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit', system-ui" }}>Track how you feel each day</p>
        </div>
      </div>

      <div className="px-4 pb-28">
        {/* Today's entry form */}
        <div className="rounded-[18px] p-5 mb-5" style={{ background: "#FFFFFF", border: "1px solid #F0E4DA", boxShadow: "0 2px 10px rgba(232,96,26,0.08)" }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#1A0E06", marginBottom: 14 }}>How are you feeling today?</p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {MOODS.map(mood => {
              const selected = selectedMood === mood.key;
              return (
                <button key={mood.key} onClick={() => setSelectedMood(mood.key)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 4px",
                    background: selected ? "#FDE8D8" : "#FFFFFF",
                    border: `${selected ? 2 : 1}px solid ${selected ? "#E8601A" : "#E8601A"}`,
                    borderRadius: 14, cursor: "pointer",
                    transform: selected ? "scale(1.05)" : "scale(1)",
                    transition: "all 160ms ease",
                  }}>
                  <span style={{ fontSize: 22 }}>{mood.emoji}</span>
                  <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, fontWeight: 700, color: selected ? "#A84818" : "#333333", textTransform: "uppercase", letterSpacing: 1, marginTop: 5 }}>{mood.label}</span>
                </button>
              );
            })}
          </div>

          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "#9A7B66", fontWeight: 700 }}>SYMPTOMS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {SYMPTOMS.map(s => {
              const on = selectedSymptoms.includes(s);
              return (
                <button key={s} onClick={() => toggleSymptom(s)}
                  style={{
                    borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                    fontFamily: "'Outfit', system-ui",
                    background: on ? "#E8601A" : "#FFFFFF",
                    color: on ? "#FFFFFF" : "#333333",
                    border: `1px solid ${on ? "#E8601A" : "#E0D5CC"}`,
                    cursor: "pointer",
                  }}>
                  {s}
                </button>
              );
            })}
          </div>

          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Anything else on your mind today?"
            rows={3}
            className="w-full text-sm resize-none"
            style={{
              background: "#fff", border: "1px solid #E0D5CC", borderRadius: 12,
              color: "#3A1A00", padding: 12, outline: "none",
              fontFamily: "'Outfit', system-ui", fontStyle: "italic",
            }} />

          <button onClick={saveEntry} disabled={!canSave || saving}
            style={{
              marginTop: 16, width: "100%",
              background: "#E8601A", color: "#FFFFFF",
              fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16,
              borderRadius: 14, padding: 14, border: "none",
              opacity: (!canSave || saving) ? 0.4 : 1,
              cursor: (!canSave || saving) ? "default" : "pointer",
              boxShadow: "0 4px 12px rgba(232,96,26,0.25)",
            }}>
            {saving ? "Saving..." : "Save today's entry ✓"}
          </button>
        </div>

        {/* History */}
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <span className="text-2xl">📔</span>
            </div>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 600, color: "white", marginBottom: 4 }}>Your entries will appear here</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>Save your first check-in above</p>
          </div>
        ) : (
          weekKeys.map(weekKey => (
            <div key={weekKey} className="mb-5">
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>{weekKey}</p>
              <div className="space-y-2">
                {grouped[weekKey].map((entry: any) => (
                  <div key={entry.id} className="rounded-[14px] p-3" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{moodEmojiFor(entry.mood)}</span>
                      <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 700, color: "white", textTransform: "capitalize" }}>{moodLabelFor(entry.mood).toLowerCase()}</span>
                      <span className="text-[10px] ml-auto" style={{ color: "rgba(255,255,255,0.6)" }}>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    {entry.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.symptoms.map((s: string) => (
                          <span key={s} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {entry.note && (
                      <p className="text-[12px] italic mb-2" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Outfit', system-ui" }}>{entry.note}</p>
                    )}
                    <button onClick={() => askDoulaAbout(entry)}
                      style={{
                        fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 500,
                        color: "rgba(255,255,255,0.7)", background: "none", border: "none", padding: 0, cursor: "pointer",
                      }}>
                      Ask doula about this →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;
