import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

interface Notification {
  id: string; title: string; body: string | null; post_id: string | null;
  is_read: boolean; created_at: string; type: string;
}

interface Props {
  onOpenNotifications: () => void;
  unreadCount: number;
}

const NotificationBell = ({ onOpenNotifications, unreadCount }: Props) => {
  return (
    <button onClick={onOpenNotifications}
      className="relative w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}>
      <Bell size={16} style={{ color: "var(--cream)" }} />
      {unreadCount > 0 && (
        <div style={{
          position: "absolute", top: -4, right: -4,
          width: 16, height: 16, borderRadius: "50%",
          background: "var(--ember)", color: "white",
          fontSize: 8, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "bellBadgePop 300ms ease",
        }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </div>
      )}
    </button>
  );
};

export default NotificationBell;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (data) setNotifications(data as Notification[]);
  };

  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    fetchNotifications();

    const channel = supabase
      .channel(`notifications-${uid}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, unreadCount, markAsRead, markAllRead, fetchNotifications };
}
