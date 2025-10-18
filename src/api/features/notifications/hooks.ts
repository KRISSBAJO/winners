import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/apiClient";
import { NotificationDoc, Paginated } from "./types";
import { useNotifStore } from "../../../realtime/useNotifStore";

/* List */
export const useNotifications = () => {
  const setNotifications = useNotifStore((s) => s.setNotifications);

  const q = useQuery<Paginated<NotificationDoc>>({
    queryKey: ["notifs", "list"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<NotificationDoc>>("/notifications?limit=30");
      return data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (q.data?.items) {
      // map server isRead -> local __read, keep ordering
      const normalized = q.data.items.map((n: any) => ({
        ...n,
        __read: typeof n.isRead === "boolean" ? n.isRead : n.__read, // prefer server truth
      }));
      setNotifications(normalized);
    }
  }, [q.data?.items, setNotifications]);

  return q;
};

/* Unread count -> Zustand (via effect) */
export const useUnreadCount = () => {
  const setUnread = useNotifStore((s) => s.setUnread); // stable selector

  const q = useQuery<number>({
    queryKey: ["notifs", "unread"],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>("/notifications/unread-count");
      return data.count;
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (typeof q.data === "number") setUnread(q.data);
  }, [q.data, setUnread]);

  return q;
};

/* Mark single read */
/* Mark single read */
export const useMarkRead = () => {
  const qc = useQueryClient();
  // ✅ get the 1-arg setter
  const markLocalRead = useNotifStore.getState().markLocalRead;

  return useMutation<{ ok: true }, unknown, string>({
    mutationFn: async (id: string) =>
      (await api.post<{ ok: true }>(`/notifications/${id}/read`)).data,
    onSuccess: (_res, id) => {
      // ✅ now this matches the signature
      markLocalRead(id);
      qc.invalidateQueries({ queryKey: ["notifs", "unread"] });
      qc.invalidateQueries({ queryKey: ["notifs", "list"] });
    },
  });
};


/* Mark all read */
export const useMarkAllRead = () => {
  const qc = useQueryClient();
  const markAllReadLocal = useNotifStore.getState().markAllReadLocal;

  return useMutation({
    mutationFn: async () => (await api.post<{ ok: true }>("/notifications/read-all")).data,
    onSuccess: () => {
      markAllReadLocal();
      qc.invalidateQueries({ queryKey: ["notifs", "unread"] });
      qc.invalidateQueries({ queryKey: ["notifs", "list"] });
    },
  });
};
