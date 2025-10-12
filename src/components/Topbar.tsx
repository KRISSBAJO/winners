// Topbar.tsx
import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import NotifBell from "./NotifBell";

export default function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shadow-sm">
      {/* Left: hamburger (mobile) + search */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 focus:ring-2 focus:ring-red-700/30 outline-none"
          />
        </div>
      </div>

      {/* Right: notifications + theme */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <NotifBell />
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
