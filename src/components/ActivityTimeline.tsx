// src/components/ActivityTimeline.tsx
import { useQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { Clock } from "lucide-react";

export default function ActivityTimeline() {
  const { data } = useQuery({
    queryKey: ["activity", "list"],
    queryFn: async () => (await api.get("/activity?limit=50")).data,
    staleTime: 30_000,
  });

  return (
    <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/70 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-600" />
        <div className="font-semibold">Recent Activity</div>
      </div>
      <ul className="space-y-3">
        {(data?.items || []).map((a:any)=>(
          <li key={a._id} className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
            <div>
              <div className="text-sm">
                <span className="font-medium">{a.actorName || "Someone"}</span> {a.verb}
                {a.target?.name ? <> <span className="font-medium"> {a.target.name}</span></> : null}
              </div>
              <div className="text-[11px] text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          </li>
        ))}
        {(!data?.items || data.items.length === 0) && (
          <div className="text-sm text-slate-500">No activity yet.</div>
        )}
      </ul>
    </div>
  );
}
