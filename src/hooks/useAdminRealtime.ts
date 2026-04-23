import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminEvent = {
  id: string;
  type: "order" | "signup" | "doula" | "like" | "premium" | "post";
  icon: string;
  message: string;
  at: string;
};

const ICONS: Record<AdminEvent["type"], string> = {
  order: "🛒",
  signup: "👤",
  doula: "💬",
  like: "❤️",
  premium: "⭐",
  post: "📝",
};

export const useAdminRealtime = (limit = 20) => {
  const [events, setEvents] = useState<AdminEvent[]>([]);

  useEffect(() => {
    const push = (e: Omit<AdminEvent, "id" | "at" | "icon"> & { at?: string }) => {
      setEvents((prev) =>
        [
          {
            id: crypto.randomUUID(),
            icon: ICONS[e.type],
            at: e.at ?? new Date().toISOString(),
            ...e,
          },
          ...prev,
        ].slice(0, limit)
      );
    };

    const channel = supabase
      .channel("admin-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (p: any) =>
        push({ type: "order", message: `New order · $${Number(p.new.total ?? 0).toFixed(2)}` })
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (p: any) =>
        push({ type: "signup", message: `New signup${p.new.first_name ? ` · ${p.new.first_name}` : ""}` })
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p: any) => {
        if (p.new.role === "user")
          push({ type: "doula", message: `Doula message · "${String(p.new.content).slice(0, 40)}…"` });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_likes" }, () =>
        push({ type: "like", message: "Community like" })
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (p: any) =>
        push({ type: "post", message: `New post · ${String(p.new.title).slice(0, 40)}` })
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "subscriptions" }, () =>
        push({ type: "premium", message: "Premium upgrade" })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return events;
};
