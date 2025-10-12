import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "../api/features/auth/hooks/useAuth";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#about", label: "About" },
    { href: "#ministries", label: "Ministries" },
    { href: "#contact", label: "Contact" },
  ];

  // Detect scroll to change background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 shadow-lg border-b border-slate-200/60 dark:border-slate-700"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-3">
        <motion.nav
          className="flex justify-between items-center"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 15 }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-800 to-yellow-500 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">
              Dominion Connect
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-slate-700 dark:text-slate-300 group transition"
              >
                <span className="group-hover:text-[#8B0000] dark:group-hover:text-[#D4AF37] transition-colors">
                  {link.label}
                </span>
                <span
                  className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-[#8B0000] to-[#D4AF37] transition-all duration-300 group-hover:w-full"
                />
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3 relative">
            {!isAuthenticated ? (
              <a
                href="/login"
                className="hidden md:inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
                }}
              >
                Admin Login
              </a>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-800 to-yellow-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition"
                >
                  <UserIcon size={18} />
                  <span className="font-semibold text-sm">
                    {user?.firstName ?? "User"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                      <a
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </a>
                      <button
                        onClick={() => logout()}
                        className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-6 w-6 text-slate-800 dark:text-slate-100" />
              ) : (
                <Menu className="h-6 w-6 text-slate-800 dark:text-slate-100" />
              )}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-[4.5rem] left-4 right-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex flex-col gap-4 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-slate-800 dark:text-slate-200 font-medium hover:text-[#8B0000] dark:hover:text-[#D4AF37] transition"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {!isAuthenticated ? (
                <a
                  href="/login"
                  className="mt-4 inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  Admin Login
                </a>
              ) : (
                <>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="mt-3 text-red-600 font-semibold hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
