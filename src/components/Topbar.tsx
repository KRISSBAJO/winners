// Topbar.tsx
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import NotifBell from "./NotifBell";

export default function Topbar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shadow-sm">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 focus:ring-2 focus:ring-red-700/30 outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* ⬇️ Use a div (or span) — NOT a button */}
        <div className="relative">
          <NotifBell />
          {/* Optional extra dot — but NotifBell already shows a badge; you can remove this */}
          {/* <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-600" /> */}
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
