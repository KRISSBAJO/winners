import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "../services/eventService";
import type { Event, EventListResponse, CreateEventInput, UpdateEventInput } from "../types/eventTypes";
import { toast } from "sonner";

/* -------- PUBLIC -------- */
export const usePublicEvents = (params: Partial<Record<string, any>>) =>
  useQuery<EventListResponse>({
    queryKey: ["events", "public", params],
    queryFn: () => eventService.listPublic(params),
    staleTime: 60_000,
  });

export const usePublicEvent = (id?: string) =>
  useQuery<Event>({
    queryKey: ["events", "public", id],
    queryFn: () => eventService.getPublic(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

/* -------- AUTH -------- */
export const useEvents = (params: Partial<Record<string, any>>) =>
  useQuery<EventListResponse>({
    queryKey: ["events", "auth", params],
    queryFn: () => eventService.list(params),
    staleTime: 30_000,
  });

export const useEvent = (id?: string) =>
  useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => eventService.get(id!),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateEventInput) => eventService.create(p),
    onSuccess: () => {
      toast.success("Event created");
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Create failed"),
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEventInput }) => eventService.update(id, payload),
    onSuccess: (ev) => {
      toast.success("Event updated");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event", ev._id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Update failed"),
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.remove(id),
    onSuccess: () => {
      toast.success("Event deleted");
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Delete failed"),
  });
};

/* -------- Likes & Comments (optimistic) -------- */
export const useToggleLike = (eventId: string, userId?: string) => {
  const qc = useQueryClient();

  // helper to read one cache shape
  const readCache = (key: any[]) => qc.getQueryData<any>(key);

  // update one cache shape if it exists
  const writeCache = (key: any[], updater: (prev: any) => any) => {
    const prev = readCache(key);
    if (prev) qc.setQueryData(key, updater(prev));
  };

  return useMutation({
    // decide like vs unlike by inspecting cache (prefers detailed "event" cache)
    mutationFn: async () => {
      const current =
        readCache(["event", eventId]) ||
        readCache(["events", "public", eventId]);

      const alreadyLiked =
        !!current &&
        Array.isArray(current.likes) &&
        !!userId &&
        current.likes.includes(userId);

      return alreadyLiked
        ? eventService.unlike(eventId)
        : eventService.like(eventId);
    },

    onMutate: async () => {
      // cancel any in-flight fetches that might overwrite our optimistic changes
      await qc.cancelQueries({ queryKey: ["event", eventId] });
      await qc.cancelQueries({ queryKey: ["events", "public"] });

      const snapshotEvent = readCache(["event", eventId]);
      const snapshotPublic = readCache(["events", "public", eventId]);

      // optimistic updater used for both caches if present
      const optimistic = (prev: any) => {
        const next = { ...prev };
        if (Array.isArray(prev.likes) && userId) {
          const had = prev.likes.includes(userId);
          next.likes = had
            ? prev.likes.filter((x: string) => x !== userId)
            : [...prev.likes, userId];
          next.likeCount = Math.max(0, (prev.likeCount || 0) + (had ? -1 : 1));
        } else {
          // fallback when we don't know userId: best-effort bump
          next.likeCount = Math.max(0, (prev.likeCount || 0) + 1);
        }
        return next;
      };

      writeCache(["event", eventId], optimistic);
      writeCache(["events", "public", eventId], optimistic);

      return { snapshotEvent, snapshotPublic };
    },

    onError: (_err, _vars, ctx: any) => {
      // rollback both caches if we changed them
      if (ctx?.snapshotEvent) qc.setQueryData(["event", eventId], ctx.snapshotEvent);
      if (ctx?.snapshotPublic) qc.setQueryData(["events", "public", eventId], ctx.snapshotPublic);
      toast.error("Could not update like");
    },

    onSettled: () => {
      // refresh details and any event lists
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "events",
      });
    },
  });
};

export const useAddComment = (eventId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => eventService.addComment(eventId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Comment added");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Failed to comment"),
  });
};

export const useUpdateComment = (eventId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      eventService.updateComment(eventId, commentId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Comment updated");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Update failed"),
  });
};

export const useDeleteComment = (eventId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => eventService.deleteComment(eventId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Comment deleted");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Delete failed"),
  });
};
