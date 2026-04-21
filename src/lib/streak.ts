import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STREAK_MILESTONE_TOASTS: Record<number, string> = {
  3: "3-day streak! 🔥",
  7: "7-day streak unlocked! 🌟",
  30: "30-day streak — you're amazing, mama! 💛",
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const yesterdayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

/**
 * Updates the daily streak for a user.
 * - same day → no change
 * - yesterday → increment current_streak
 * - 2+ days gap → reset to 1
 * Fires milestone toasts on 3 / 7 / 30.
 */
export async function updateStreak(userId: string): Promise<{ current: number; longest: number } | null> {
  if (!userId) return null;
  const today = todayISO();

  const { data: row } = await supabase
    .from("streak_state")
    .select("current_streak, longest_streak, last_checkin_date")
    .eq("user_id", userId)
    .maybeSingle();

  let nextCurrent = 1;
  let nextLongest = 1;

  if (row) {
    const last = row.last_checkin_date;
    if (last === today) {
      // already checked in today
      return { current: row.current_streak, longest: row.longest_streak };
    } else if (last === yesterdayISO()) {
      nextCurrent = row.current_streak + 1;
    } else {
      nextCurrent = 1;
    }
    nextLongest = Math.max(row.longest_streak ?? 0, nextCurrent);
  }

  const { error } = await supabase
    .from("streak_state")
    .upsert(
      { user_id: userId, current_streak: nextCurrent, longest_streak: nextLongest, last_checkin_date: today, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("streak upsert failed", error);
    return null;
  }

  if (STREAK_MILESTONE_TOASTS[nextCurrent]) {
    toast.success(STREAK_MILESTONE_TOASTS[nextCurrent]);
  }

  return { current: nextCurrent, longest: nextLongest };
}

export async function getStreak(userId: string): Promise<{ current: number; longest: number } | null> {
  if (!userId) return null;
  const { data } = await supabase
    .from("streak_state")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return { current: 0, longest: 0 };
  return { current: data.current_streak, longest: data.longest_streak };
}
