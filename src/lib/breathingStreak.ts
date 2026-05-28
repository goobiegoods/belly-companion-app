import { supabase } from "@/integrations/supabase/client";

const todayISO = () => new Date().toISOString().slice(0, 10);
const yesterdayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export async function recordBreathingSession(userId: string): Promise<{ current: number; longest: number } | null> {
  if (!userId) return null;
  const today = todayISO();

  const { data: row } = await supabase
    .from("breathing_streak")
    .select("current_streak, longest_streak, last_session_date")
    .eq("user_id", userId)
    .maybeSingle();

  let nextCurrent = 1;
  let nextLongest = 1;

  if (row) {
    const last = row.last_session_date;
    if (last === today) {
      return { current: row.current_streak, longest: row.longest_streak };
    } else if (last === yesterdayISO()) {
      nextCurrent = row.current_streak + 1;
    } else {
      nextCurrent = 1;
    }
    nextLongest = Math.max(row.longest_streak ?? 0, nextCurrent);
  }

  const { error } = await supabase
    .from("breathing_streak")
    .upsert(
      { user_id: userId, current_streak: nextCurrent, longest_streak: nextLongest, last_session_date: today, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("breathing streak upsert failed", error);
    return null;
  }
  return { current: nextCurrent, longest: nextLongest };
}

export async function getBreathingStreak(userId: string): Promise<{ current: number; longest: number }> {
  if (!userId) return { current: 0, longest: 0 };
  const { data } = await supabase
    .from("breathing_streak")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return { current: 0, longest: 0 };
  return { current: data.current_streak, longest: data.longest_streak };
}
