// src/components/Topbar.tsx
import {
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  ShieldCheck,
  Command,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NotifBell from "./NotifBell";
import { useAuthStore } from "../api/features/auth/store/useAuthStore";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h = () => setReduced(mq.matches);
    h();
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return reduced;
}

function ActingChip() {
  const { actingOverride } = useAuthStore();
  if (!actingOverride?.roleLike) return null;

  const untilTxt = actingOverride.until
    ? ` • until ${new Date(actingOverride.until).toLocaleString()}`
    : "";

  return (
    <span
      className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium px-2.5 py-1.5 rounded-lg
                 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900 border border-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]
                 dark:from-amber-900/30 dark:to-amber-900/20 dark:text-amber-200 dark:border-amber-800/60"
      title={`Acting scope-limited menus${untilTxt ? ` (${untilTxt.replace(" • ", "")})` : ""}`}
    >
      <ShieldCheck className="w-4 h-4" />
      Acting: {actingOverride.roleLike}
      {untilTxt}
    </span>
  );
}

export default function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [dark, setDark] = useState(false);
  const [elevated, setElevated] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Shadow elevation on scroll
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // CMD/CTRL + K to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-40",
        "flex items-center justify-between gap-3",
        "px-3 sm:px-6 py-2.5 sm:py-3",
        // Glass + gradient
        "bg-white/65 dark:bg-slate-900/70 backdrop-blur-xl",
        "border-b border-slate-200/70 dark:border-white/10",
        // Soft inner light & subtle shadow that grows on scroll
        elevated
          ? "shadow-[0_6px_20px_-12px_rgba(0,0,0,.35)]"
          : "shadow-[0_4px_14px_-12px_rgba(0,0,0,.25)]",
        "transition-shadow",
      ].join(" ")}
    >
      {/* Left: hamburger + brand + acting chip */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-200">
            Dominion Connect
          </span>
        </div>

        <ActingChip />
      </div>

      {/* Center: Search (md+) */}
      <div className="flex-1 hidden md:flex justify-center px-2">
        <div
          className={[
            "relative w-full max-w-xl group",
            "transition-[transform,box-shadow] ease-out",
            reducedMotion ? "" : "focus-within:scale-[1.01]",
          ].join(" ")}
        >
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={16}
          />
          <input
            ref={searchRef}
            placeholder="Search (⌘/Ctrl + K)…"
            className={[
              "w-full pl-9 pr-12 py-2 rounded-lg text-sm",
              "bg-white/70 dark:bg-slate-800/70",
              "border border-slate-200/70 dark:border-slate-700",
              "focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]/40 outline-none",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "transition-[box-shadow,border,background]",
            ].join(" ")}
          />
          <kbd
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200
                       dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hidden lg:block"
            aria-hidden
          >
            <span className="inline-flex items-center gap-1">
              <Command size={12} />
              K
            </span>
          </kbd>
        </div>
      </div>

      {/* Right: notifications + theme */}
      <div className="flex items-center gap-1.5 sm:gap-2">
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
