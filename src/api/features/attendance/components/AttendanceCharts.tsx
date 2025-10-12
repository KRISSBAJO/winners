// src/api/features/attendance/components/AttendanceCharts.tsx
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";

/** ------- Types your endpoints may return ------- */
type AttendanceItem = {
  _id: string;
  churchId: string;
  serviceDate: string; // ISO
  serviceType: string;
  men?: number; women?: number; children?: number;
  firstTimers?: number; newConverts?: number; holyGhostBaptisms?: number;
  online?: number; ushers?: number; choir?: number;
};

type TimeseriesPoint = {
  _id: string; // ISO date (aggregation key)
  total?: number;
  men?: number; women?: number; children?: number;
  firstTimers?: number; newConverts?: number; holyGhostBaptisms?: number;
};

type WeeklyAgg = {
  _id: { week: number; year: number };
  total?: number;
  firstTimers?: number; newConverts?: number; holyGhostBaptisms?: number;
};

/** ------- Helpers ------- */
function computeTotal(a: Partial<AttendanceItem | TimeseriesPoint> = {}) {
  const {
    men = 0, women = 0, children = 0,
    online = 0, ushers = 0, choir = 0,
    // total may already exist (e.g. timeseries), prefer computed fallback
    total,
  } = a as any;
  const computed = men + women + children + online + ushers + choir;
  return typeof total === "number" ? total : computed;
}

function toDateLabel(iso: string) {
  // "2025-10-06"
  return (iso || "").slice(0, 10);
}

/** ------- DAILY CHART ------- */
/** Accepts either:
 * - data = output of /attendance/timeseries (array with _id: ISO date)
 * - data = output of /attendance list "items" (array with serviceDate)
 */
export function DailyChart({ data }: { data: Array<TimeseriesPoint | AttendanceItem> }) {
  const rows = (data || []).map((d: any) => {
    const dateISO = d.serviceDate ?? d._id; // list uses serviceDate, timeseries uses _id
    return {
      date: toDateLabel(dateISO),
      total: computeTotal(d),
      men: d.men ?? 0,
      women: d.women ?? 0,
      children: d.children ?? 0,
      firstTimers: d.firstTimers ?? 0,
      newConverts: d.newConverts ?? 0,
      holyGhostBaptisms: d.holyGhostBaptisms ?? 0,
    };
  });

  return (
    <div className="rounded-xl border p-4 bg-white/80 dark:bg-slate-900/70">
      <div className="font-semibold mb-2">Daily Attendance</div>
      <div className="h-64">
        <ResponsiveContainer>
          <AreaChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="total" name="Total" stroke="#8B0000" fill="#8B0000" fillOpacity={0.15} />
            {/* Optional stacked components if you want to visualize composition */}
            {/* <Area type="monotone" dataKey="men" stroke="#1f77b4" fill="#1f77b4" fillOpacity={0.08} />
            <Area type="monotone" dataKey="women" stroke="#ff7f0e" fill="#ff7f0e" fillOpacity={0.08} />
            <Area type="monotone" dataKey="children" stroke="#2ca02c" fill="#2ca02c" fillOpacity={0.08} /> */}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** ------- WEEKLY CHART ------- */
/** Accepts either:
 * - data = output of /attendance/weekly (with _id.week/_id.year)
 * - OR raw list "items" and we’ll group by ISO week on the client.
 */
export function WeeklyChart({ data }: { data: Array<WeeklyAgg | AttendanceItem> }) {
  // Detect if we got real weekly aggregation
  const hasWeeklyShape = Array.isArray(data) && data[0] && (data[0] as any)._id?.week !== undefined;

  let rows: Array<{ label: string; total: number; firstTimers: number; newConverts: number; holyGhostBaptisms: number }>;

  if (hasWeeklyShape) {
    // Server-aggregated
    rows = (data as WeeklyAgg[]).map((d) => ({
      label: `W${d._id.week}-${d._id.year}`,
      total: d.total ?? 0,
      firstTimers: d.firstTimers ?? 0,
      newConverts: d.newConverts ?? 0,
      holyGhostBaptisms: d.holyGhostBaptisms ?? 0,
    }));
  } else {
    // Client aggregate from items
    const items = (data as AttendanceItem[]) || [];
    const map = new Map<string, { total: number; firstTimers: number; newConverts: number; holyGhostBaptisms: number }>();

    for (const a of items) {
      const d = new Date(a.serviceDate);
      // ISO week helpers
      const dayNum = (d.getUTCDay() + 6) % 7; // 0..6 starting Monday
      d.setUTCDate(d.getUTCDate() - dayNum + 3); // Thursday of current week
      const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
      const diff = d.getTime() - firstThursday.getTime();
      const week = 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
      const year = d.getUTCFullYear();
      const key = `${year}-${week}`;

      const bucket = map.get(key) || { total: 0, firstTimers: 0, newConverts: 0, holyGhostBaptisms: 0 };
      bucket.total += computeTotal(a);
      bucket.firstTimers += a.firstTimers ?? 0;
      bucket.newConverts += a.newConverts ?? 0;
      bucket.holyGhostBaptisms += a.holyGhostBaptisms ?? 0;
      map.set(key, bucket);
    }

    rows = Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([key, v]) => {
        const [year, week] = key.split("-");
        return {
          label: `W${week}-${year}`,
          ...v,
        };
      });
  }

  return (
    <div className="rounded-xl border p-4 bg-white/80 dark:bg-slate-900/70">
      <div className="font-semibold mb-2">Weekly Overview</div>
      <div className="h-64">
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name="Total" stroke="#8B0000" />
            <Line type="monotone" dataKey="firstTimers" name="First Timers" stroke="#1f77b4" />
            <Line type="monotone" dataKey="newConverts" name="New Converts" stroke="#2ca02c" />
            <Line type="monotone" dataKey="holyGhostBaptisms" name="Holy Ghost Baptisms" stroke="#d62728" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
