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
      user_id: user.id,
      date: today,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      note: note || null,
      week_number: currentWeek,
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

  // Group entries by week
  const grouped: Record<string, any[]> = {};
  entries.forEach(e => {
    const key = `Week ${e.week_number || "?"}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <div className="min-h-screen bg-belly-bg pb-20">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-[22px] font-bold text-foreground">Journal</h1>
        <p className="text-[11px] text-belly-text-muted">Track how you feel each day</p>
      </div>

      {!hasCheckedInToday && (
        <div className="px-5 mb-5">
          <div className="bg-card border border-belly-card-border rounded-card p-5">
            <p className="font-display text-[16px] font-bold text-foreground mb-4">How are you feeling today?</p>
            
            {/* Mood selector */}
            <div className="flex justify-between mb-5">
              {MOODS.map(mood => (
                <button key={mood.label} onClick={() => setSelectedMood(mood.label)} className={`flex flex-col items-center gap-1 belly-btn-press ${selectedMood === mood.label ? "scale-110" : ""}`}>
                  <span className={`text-2xl ${selectedMood === mood.label ? "" : "opacity-50"}`}>{mood.emoji}</span>
                  <span className={`text-[10px] ${selectedMood === mood.label ? "text-belly-accent font-semibold" : "text-belly-text-hint"}`}>{mood.label}</span>
                </button>
              ))}
            </div>

            {/* Symptoms */}
            <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">SYMPTOMS</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SYMPTOMS.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)} className={`rounded-pill px-3 py-1.5 text-[11px] belly-btn-press ${selectedSymptoms.includes(s) ? "bg-primary text-primary-foreground" : "bg-belly-icon-bg text-belly-accent border border-belly-card-border"}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Free write */}
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Anything else on your mind today?" rows={3} className="w-full text-sm placeholder:text-belly-text-hint placeholder:font-display placeholder:italic border border-belly-card-border rounded-input p-3 belly-input-focus resize-none bg-transparent mb-4" />

            <button onClick={saveEntry} disabled={!selectedMood || saving} className="w-full h-11 rounded-input bg-primary text-primary-foreground text-sm font-semibold belly-btn-press disabled:opacity-40">
              {saving ? "Saving..." : "Save check-in"}
            </button>
          </div>
        </div>
      )}

      {/* History */}
      <div className="px-5">
        {entries.length === 0 && hasCheckedInToday ? null : entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-belly-icon-bg mx-auto mb-3 flex items-center justify-center"><span className="text-2xl">📔</span></div>
            <p className="font-display text-[16px] font-bold text-foreground mb-1">Start tracking how you feel today</p>
            <p className="text-[11px] text-belly-text-muted">Your entries will appear here</p>
          </div>
        ) : (
          Object.entries(grouped).map(([weekLabel, weekEntries]) => (
            <div key={weekLabel} className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">{weekLabel}</p>
              <div className="space-y-2">
                {weekEntries.map((entry: any) => (
                  <div key={entry.id} className="bg-card border border-belly-card-border rounded-card p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{moodEmoji(entry.mood)}</span>
                      <span className="text-[13px] font-semibold text-foreground">{entry.mood}</span>
                      <span className="text-[10px] text-belly-text-hint ml-auto">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    {entry.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {entry.symptoms.map((s: string) => (
                          <span key={s} className="text-[9px] bg-belly-icon-bg text-belly-accent px-2 py-0.5 rounded-pill">{s}</span>
                        ))}
                      </div>
                    )}
                    {entry.note && <p className="text-[12px] text-belly-text-muted line-clamp-2">{entry.note}</p>}
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
