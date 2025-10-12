import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { useNotifications, useUnreadCount, useMarkAllRead, useMarkRead } from "../api/features/notifications/hooks";
import { useNotifStore } from "../realtime/useNotifStore";
import { Link } from "react-router-dom";

export default function NotifBell() {
  // these hooks now write to the store via effects only (safe)
  const { data } = useNotifications();
  useUnreadCount();

  const unread = useNotifStore((s) => s.unread);
  const markAll = useMarkAllRead();
  const markOne = useMarkRead();

  const [open, setOpen] = useState(false);
  const items = data?.items ?? [];

  return (
    <div className="relative">
      <button
        className="relative rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1.5 py-0.5">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] rounded-2xl border bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="font-medium">Notifications</div>
            <button
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="text-xs inline-flex items-center gap-1 hover:opacity-80 disabled:opacity-50"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.map((n: any) => (
              <div key={n._id} className="px-3 py-2 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div className="text-sm font-medium">{n.title}</div>
                {n.message && <div className="text-xs text-slate-500">{n.message}</div>}
                <div className="mt-1 flex items-center gap-2">
                  {n.link && <Link to={n.link} className="text-xs text-amber-700 hover:underline">Open</Link>}
                  {!n.isRead && (
                    <button
                      onClick={() => markOne.mutate(n._id)}
                      disabled={markOne.isPending}
                      className="text-xs text-slate-500 hover:underline disabled:opacity-50"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="px-3 py-6 text-sm text-center text-slate-500">No notifications yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
