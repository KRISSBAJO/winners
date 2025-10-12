// src/realtime/useRealtime.ts
import { useEffect } from "react";
import { connectSocket } from "./socketClient";
import { useAuthStore } from "../api/features/auth/store/useAuthStore";
import { toast } from "sonner";
import { useNotifStore } from "./useNotifStore";
import type { NotificationDoc } from "../api/features/notifications/types";

export function useRealtime() {
  const { accessToken } = useAuthStore();
  const addNotification = useNotifStore((s) => s.addNotification);
  const addActivity = useNotifStore((s) => s.addActivity);

  useEffect(() => {
    if (!accessToken) return;
    const s = connectSocket(accessToken);

    s.on("notification:new", (n: { title: string; message: string }) => {
      const doc: NotificationDoc = {
        _id: (globalThis.crypto?.randomUUID?.() ?? String(Date.now())),
        kind: "system",
        scope: "user",
        title: n.title,
        message: n.message,
        link: undefined,
        actorId: undefined,
        actorName: undefined,
        scopeRef: undefined,
        recipients: [],
        readBy: [],
        createdAt: new Date().toISOString(),
      };
      addNotification(doc);
      toast(n.title, { description: n.message });
    });

    s.on("activity:new", (a: { id: string; description: string }) => {
      addActivity(a);
    });

    return () => {
      s.off("notification:new");
      s.off("activity:new");
    };
  }, [accessToken, addNotification, addActivity]);
}
