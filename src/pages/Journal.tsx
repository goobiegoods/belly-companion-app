import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { toast } from "sonner";

const MOODS = [
  { label: "Wonderful", emoji: "🌟" },
  { label: "Good", emoji: "😊" },
  { label: "Okay", emoji: "😐" },
  { label: "Tired", emoji: "😴" },
  { label: "Struggling", emoji: "😢" },
];

const SYMPTOMS = [
  "Nausea", "Fatigue", "Back pain", "Heartburn", "Swelling",
  "Headache", "Insomnia", "Mood changes", "Cravings", "Other",
];

const Journal = () => {
  const { user, profile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moodError, setMoodError] = useState(false);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;

  useEffect(() => { if (user) fetchEntries(); }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase.from("journal_entries").select("*").eq("user_id", user.id).order("date", { ascending: false });
    setEntries(data || []);
    const today = new Date().toISOString().split("T")[0];
    setHasCheckedInToday(!!data?.find(e => e.date === today));
  };

  const saveEntry = async () => {
    if (!user) return;
    if (!selectedMood) { setMoodError(true); return; }
    setMoodError(false);
    setSaving(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id, date: today, mood: selectedMood,
      symptoms: selectedSymptoms, note: note || null, week_number: currentWeek
    });
    setSaving(false);
    if (error) { toast.error("Something went wrong. Try again."); return; }
    toast.success("Check-in saved 🌸");
    setTimeout(() => {
      setSelectedMood(null); setSelectedSymptoms([]); setNote(""); setMoodError(false);
      fetchEntries();
    }, 500);
  };

  const toggleSymptom = (s: string) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const moodEmoji = (mood: string) => MOODS.find(m => m.label === mood)?.emoji || "😐";

  const grouped: Record<string, any[]> = {};
  entries.forEach(e => { const key = `Week ${e.week_number || "?"}`; if (!grouped[key]) grouped[key] = []; grouped[key].push(e); });

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#FEF8F4", overflow: "hidden" }}>
      <div className="px-5 pt-5 pb-3 shrink-0">
        <h1 className="font-display text-[22px] font-semibold" style={{ color: "#C85828" }}>Journal</h1>
        <p className="text-[11px]" style={{ color: "#C4906A" }}>Track how you feel each day</p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch", paddingBottom: hasCheckedInToday ? 100 : 0 }}>
        {!hasCheckedInToday && (
          <div className="px-4 mb-4">
            <div className="rounded-[17px] p-5" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
              <p className="font-display text-[16px] font-semibold mb-4" style={{ color: "#A84E28" }}>How are you feeling today?</p>

              {/* Mood selector */}
              <div className="flex justify-between mb-2">
                {MOODS.map(mood => (
                  <button key={mood.label} onClick={() => { setSelectedMood(mood.label); setMoodError(false); }}
                    className="flex flex-col items-center gap-1" style={{ transition: "all 180ms ease" }}>
                    <div className="flex items-center justify-center" style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: selectedMood === mood.label ? "linear-gradient(145deg, #FF7840, #FFAB80)" : "rgba(255,255,255,0.75)",
                      border: selectedMood === mood.label ? "none" : "0.5px solid rgba(255,170,130,0.25)",
                      boxShadow: selectedMood === mood.label ? "0 3px 10px rgba(255,120,64,0.3)" : "none",
                      transition: "all 180ms ease",
                    }}>
                      <span className="text-xl">{mood.emoji}</span>
                    </div>
                    <span style={{
                      fontSize: 7, color: selectedMood === mood.label ? "#FF7840" : "rgba(180,100,60,0.5)",
                      fontWeight: selectedMood === mood.label ? 600 : 400
                    }}>{mood.label}</span>
                  </button>
                ))}
              </div>
              {moodError && <p className="text-[11px] mb-3" style={{ color: "#E07040" }}>Please select how you're feeling today 🌸</p>}

              {/* Symptoms */}
              <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, marginTop: 12, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>SYMPTOMS</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    style={{
                      borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 500,
                      background: selectedSymptoms.includes(s) ? "rgba(255,184,153,0.25)" : "rgba(255,255,255,0.75)",
                      color: selectedSymptoms.includes(s) ? "#C85828" : "#C4784A",
                      border: selectedSymptoms.includes(s) ? "1px solid #FF7840" : "0.5px solid rgba(255,170,130,0.22)",
                      transition: "all 180ms ease",
                    }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Note */}
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Anything else on your mind today?"
                rows={3}
                className="w-full text-sm placeholder:font-display placeholder:italic resize-none mb-2"
                style={{
                  border: "0.5px solid rgba(255,170,130,0.22)", background: "rgba(255,255,255,0.68)",
                  color: "#A84E28", borderRadius: 10, padding: 12, outline: "none",
                }} />
            </div>
          </div>
        )}

        {/* Past entries */}
        <div className="px-4">
          {entries.length === 0 && !hasCheckedInToday ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(255,200,170,0.2)" }}>
                <span className="text-2xl">📔</span>
              </div>
              <p className="font-display text-[16px] font-semibold mb-1" style={{ color: "#A84E28" }}>Start tracking how you feel today</p>
              <p className="text-[11px]" style={{ color: "rgba(180,100,60,0.38)" }}>Your entries will appear here</p>
            </div>
          ) : (
            Object.entries(grouped).map(([weekLabel, weekEntries]) => (
              <div key={weekLabel} className="mb-4">
                <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>{weekLabel}</p>
                <div className="space-y-2">
                  {weekEntries.map((entry: any) => (
                    <div key={entry.id} className="rounded-[14px] p-3" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{moodEmoji(entry.mood)}</span>
                        <span className="text-[13px] font-semibold" style={{ color: "#A84E28" }}>{entry.mood}</span>
                        <span className="text-[10px] ml-auto" style={{ color: "rgba(180,100,60,0.38)" }}>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      {entry.symptoms?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {entry.symptoms.map((s: string) => (
                            <span key={s} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,200,170,0.2)", color: "#C4906A" }}>{s}</span>
                          ))}
                        </div>
                      )}
                      {entry.note && <p className="text-[12px] line-clamp-2" style={{ color: "#C4906A" }}>{entry.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky save button */}
      {!hasCheckedInToday && (
        <div className="shrink-0" style={{
          background: "rgba(254,248,244,0.95)", padding: "12px 16px 20px",
          borderTop: "0.5px solid rgba(255,170,130,0.15)", backdropFilter: "blur(16px)",
        }}>
          <button onClick={saveEntry} disabled={saving}
            style={{
              width: "100%", background: "linear-gradient(145deg, #FF7840, #FFAB80)",
              border: "none", borderRadius: 16, padding: 15,
              fontSize: 15, fontWeight: 600, color: "white",
              boxShadow: "0 4px 16px rgba(255,120,64,0.28)",
              cursor: "pointer", opacity: saving ? 0.6 : 1,
            }}>
            {saving ? "Saving..." : "Save check-in"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Journal;
