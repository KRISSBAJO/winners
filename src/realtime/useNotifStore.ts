// src/realtime/useNotifStore.ts
import { create } from "zustand";
import type { NotificationDoc } from "../api/features/notifications/types";

type Notif = NotificationDoc & { __read?: boolean };
type Activity = any; // keep/replace with your real type

type NotifState = {
  notifications: Notif[];
  activities: Activity[];
  unread: number;

  // writers
  setUnread: (n: number) => void;
  setNotifications: (items: Notif[]) => void;
  hydrateInbox: (items: Notif[], unread: number) => void;

  // realtime helpers
  addNotification: (n: Notif) => void;
  addActivity: (a: Activity) => void;

  // local read helpers
  markLocalRead: (id: string) => void;
  markAllReadLocal: () => void;
};

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  activities: [],
  unread: 0,

  /* writers */
  setUnread: (n) => set((s) => (s.unread === n ? s : { unread: n })),
  setNotifications: (items) => set({ notifications: items }),
  hydrateInbox: (items, unread) => set({ notifications: items, unread }),

  /* realtime helpers */
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unread: n.__read ? s.unread : s.unread + 1,
    })),
  addActivity: (a) => set((s) => ({ activities: [a, ...s.activities] })),

  /* local read helpers */
  markLocalRead: (id) =>
    set((s) => {
      const next = s.notifications.map((x) =>
        x._id === id ? { ...x, __read: true } : x
      );
      const unread = next.filter((x) => !x.__read).length;
      return { notifications: next, unread };
    }),

  markAllReadLocal: () =>
    set((s) => ({
      notifications: s.notifications.map((x) => ({ ...x, __read: true })),
      unread: 0,
    })),
}));
