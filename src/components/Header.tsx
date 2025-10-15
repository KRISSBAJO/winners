import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../api/features/auth/hooks/useAuth";
import Logo from "../assets/images/logo1.png";

const BRAND_PRIMARY = "#021347"; // Deep Blue
const BRAND_ACCENT = "#8B0000"; // Rich Deep Red
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_ACCENT}, ${BRAND_GOLD})`;

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "#features", label: "Features" },
    { href: "#ministries", label: "Ministries" },
    { href: "#events", label: "Events" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header
       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    scrolled
      ? "backdrop-blur-xl bg-[#021347]/80 border-b border-white/10 shadow-lg"
      : "backdrop-blur-xl bg-[#021347] border-b border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <img src={Logo} alt="Logo" className="h-10 w-10 rounded bg-white/90" />
          <span className="hidden sm:block font-extrabold text-white tracking-tight group-hover:text-[#D4AF37] transition">
            Dominion Connect
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-white/80 hover:text-white font-semibold tracking-wide text-sm transition"
            >
              {l.label}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-[#8B0000] to-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <a
              href="/login"
              className="hidden md:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md hover:brightness-110"
              style={{ background: GRADIENT }}
            >
              Admin Login
            </a>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white/90 hover:bg-white/10 ring-1 ring-white/20 transition"
              >
                <User size={16} />
                <span>{user?.firstName ?? "User"}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl"
                  >
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white/90 hover:bg-white/10"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </a>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu */}
          <button
            onClick={() => setMenu(!menu)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 text-white rounded bg-white/10 hover:bg-white/20"
          >
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#021347]/95 backdrop-blur-xl mx-4 mt-2 rounded-2xl p-6 text-center border border-white/10"
          >
            {nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenu(false)}
                className="block text-white/90 py-2 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            {!isAuthenticated ? (
              <a
                href="/login"
                className="mt-3 inline-block rounded-xl px-5 py-2 text-sm font-bold text-white"
                style={{ background: GRADIENT }}
              >
                Admin Login
              </a>
            ) : (
              <button
                onClick={logout}
                className="mt-3 text-red-300 font-semibold hover:text-red-400"
              >
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
