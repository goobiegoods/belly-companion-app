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

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : null;

  useEffect(() => {
    if (!user) return;
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setEntries(data || []);
    const today = new Date().toISOString().split("T")[0];
    setHasCheckedInToday(!!data?.find(e => e.date === today));
  };

  const saveEntry = async () => {
    if (!user || !selectedMood) return;
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("journal_entries").insert({
      user_id: user.id, date: today, mood: selectedMood,
      symptoms: selectedSymptoms, note: note || null, week_number: currentWeek,
    });
    setSaving(false);
    toast.success("Check-in saved! 🌸");
    setSelectedMood(null);
    setSelectedSymptoms([]);
    setNote("");
    fetchEntries();
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const moodEmoji = (mood: string) => MOODS.find(m => m.label === mood)?.emoji || "😐";

  const grouped: Record<string, any[]> = {};
  entries.forEach(e => {
    const key = `Week ${e.week_number || "?"}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-[22px] font-bold" style={{ color: "#2A1200" }}>Journal</h1>
        <p className="text-[11px]" style={{ color: "#D4906A" }}>Track how you feel each day</p>
      </div>

      {!hasCheckedInToday && (
        <div className="px-5 mb-5">
          <div className="belly-glass-card rounded-[16px] p-5">
            <p className="font-display text-[16px] font-bold mb-4" style={{ color: "#2A1200" }}>How are you feeling today?</p>
            <div className="flex justify-between mb-5">
              {MOODS.map(mood => (
                <button key={mood.label} onClick={() => setSelectedMood(mood.label)} className={`flex flex-col items-center gap-1 belly-btn-press ${selectedMood === mood.label ? "scale-110" : ""}`}>
                  <span className={`text-2xl ${selectedMood === mood.label ? "" : "opacity-50"}`}>{mood.emoji}</span>
                  <span className="text-[10px]" style={{ color: selectedMood === mood.label ? "#D4906A" : "#D4B0A0", fontWeight: selectedMood === mood.label ? 600 : 400 }}>{mood.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>SYMPTOMS</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SYMPTOMS.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className="rounded-full px-3 py-1.5 text-[11px] belly-btn-press"
                  style={{
                    background: selectedSymptoms.includes(s) ? "#FFB899" : "rgba(255,240,232,0.8)",
                    color: selectedSymptoms.includes(s) ? "#2A1200" : "#D4906A",
                    border: `1px solid ${selectedSymptoms.includes(s) ? "#FFB899" : "rgba(255,228,212,0.6)"}`,
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Anything else on your mind today?" rows={3}
              className="w-full text-sm placeholder:font-display placeholder:italic rounded-[10px] p-3 belly-input-focus resize-none mb-4"
              style={{ border: "1px solid rgba(255,228,212,0.8)", background: "rgba(255,248,245,0.9)", color: "#2A1200" }} />
            <button onClick={saveEntry} disabled={!selectedMood || saving}
              className="w-full h-11 rounded-[12px] text-sm font-semibold belly-btn-primary disabled:opacity-40"
              style={{ background: "#FFB899", color: "#2A1200" }}>
              {saving ? "Saving..." : "Save check-in"}
            </button>
          </div>
        </div>
      )}

      <div className="px-5">
        {entries.length === 0 && hasCheckedInToday ? null : entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(255,240,232,0.8)" }}><span className="text-2xl">📔</span></div>
            <p className="font-display text-[16px] font-bold mb-1" style={{ color: "#2A1200" }}>Start tracking how you feel today</p>
            <p className="text-[11px]" style={{ color: "#D4B0A0" }}>Your entries will appear here</p>
          </div>
        ) : (
          Object.entries(grouped).map(([weekLabel, weekEntries]) => (
            <div key={weekLabel} className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>{weekLabel}</p>
              <div className="space-y-2">
                {weekEntries.map((entry: any) => (
                  <div key={entry.id} className="belly-glass-card rounded-[14px] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{moodEmoji(entry.mood)}</span>
                      <span className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{entry.mood}</span>
                      <span className="text-[10px] ml-auto" style={{ color: "#D4B0A0" }}>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    {entry.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {entry.symptoms.map((s: string) => (
                          <span key={s} className="text-[9px] px-2 py-0.5 rounded-full belly-badge-glass" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {entry.note && <p className="text-[12px] line-clamp-2" style={{ color: "#D4906A" }}>{entry.note}</p>}
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
