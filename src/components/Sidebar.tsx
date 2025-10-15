import {
  ChevronLeft,
  LogOut,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  UserCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../api/features/auth/store/useAuthStore";
import Logo from "../assets/images/logo1.png";
import { roleBasedNav } from "./roleBasedNav";

type NavItem = {
  name: string;
  icon: any;
  to?: string;
  type: "link" | "group";
  children?: NavItem[];
};

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pinned?: boolean;
  setPinned?: React.Dispatch<React.SetStateAction<boolean>>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };
const submenuVariants = {
  open: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  closed:{ height: 0, opacity: 0,   transition: { duration: 0.2,  ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const { clearAuth, user } = useAuthStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const isDesktopCollapsed = collapsed && !hovered;
  const navItems = roleBasedNav[user?.role || "volunteer"] as NavItem[];

  const toggleGroup = (groupName: string) => setOpenGroups((p) => ({ ...p, [groupName]: !p[groupName] }));
  const handleLogout = () => { clearAuth(); navigate("/login"); };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setMobileOpen]);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setMobileOpen]);

  const sidebarWidth = isDesktopCollapsed ? 80 : 280;
  const sidebarPosition = mobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      <motion.aside
        layout
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseLeave={() => !isMobile && setHovered(false)}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed lg:relative z-50 h-screen
          bg-gradient-to-b from-white/95 via-white/80 to-slate-100/70
          dark:from-slate-900/95 dark:via-slate-800/80 dark:to-slate-700/70
          backdrop-blur-3xl border-r border-gradient-to-b from-slate-200/50 to-slate-300/30
          dark:from-slate-700/50 dark:to-slate-600/30 flex flex-col
          shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50
          overflow-y-auto lg:overflow-y-visible transition-transform duration-300 lg:translate-x-0 ${sidebarPosition}`}
        style={{ width: isMobile ? "280px" : undefined }}
      >
        {/* Header / Logo */}
        <motion.div
          layout
          className="flex items-center gap-3 px-4 py-4 border-b border-slate-200/40 dark:border-slate-700/40 relative"
        >
          <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-br cursor-pointer inline-flex items-center justify-center shadow-red-500/20 relative z-10">
              <img src={Logo} alt="Logo" className="h-6 w-6 rounded-lg object-cover" />
            </Link>
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#8B0000]/20 to-[#D4AF37]/20 blur-xl pointer-events-none"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <AnimatePresence>
            {(!isDesktopCollapsed || isMobile) && (
              <motion.h1
                layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-xs font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent whitespace-nowrap tracking-tight"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation (let aside handle scroll) */}
        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 p-2 space-y-1"
        >
          {navItems.map((item) => (
            <div key={item.name} className="space-y-0.5">
              {item.type === "link" ? (
                <NavLink
                  to={item.to!}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-[#8B0000]/20 to-[#D4AF37]/20 text-[#8B0000] dark:text-[#D4AF37] shadow-inner shadow-red-500/10"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100/50 hover:to-slate-200/50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50"
                    } ${isDesktopCollapsed && !isMobile ? "justify-center" : ""}`
                  }
                >
                  <motion.div layout className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg" whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
                    <item.icon className="w-5 h-5 transition-colors group-hover:text-[#8B0000] dark:group-hover:text-[#D4AF37]" />
                  </motion.div>
                  {(!isDesktopCollapsed || isMobile) && (
                    <motion.span layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0">
                      {item.name}
                    </motion.span>
                  )}
                  <AnimatePresence>
                    {isDesktopCollapsed && !isMobile ? null : (
                      <motion.div
                        className="absolute right-3 w-1 h-4 bg-gradient-to-b from-[#8B0000] to-[#D4AF37] rounded"
                        initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0 }} transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </NavLink>
              ) : (
                <>
                  <motion.button
                    onClick={() => toggleGroup(item.name)}
                    className="group relative flex items-center justify-between w-full gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-left transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100/50 hover:to-slate-200/50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50"
                    whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <motion.div
                        layout
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-600/50 group-hover:bg-gradient-to-br group-hover:from-[#8B0000]/10 group-hover:to-[#D4AF37]/10"
                      >
                        <item.icon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-[#8B0000] dark:group-hover:text-[#D4AF37]" />
                      </motion.div>
                      {(!isDesktopCollapsed || isMobile) && <motion.span layout className="flex-1 min-w-0">{item.name}</motion.span>}
                    </div>
                    {(!isDesktopCollapsed || isMobile) && (
                      <motion.div animate={{ rotate: openGroups[item.name] ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="flex-shrink-0 w-5 h-5 text-slate-400 group-hover:text-[#8B0000] dark:group-hover:text-[#D4AF37]">
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {openGroups[item.name] && (!isDesktopCollapsed || isMobile) && (
                      <motion.ul layout variants={submenuVariants} initial="closed" animate="open" exit="closed" className="space-y-1 overflow-hidden ml-0 pl-0">
                        {item.children?.map((child) => (
                          <motion.li key={child.name} variants={itemVariants} className="ml-6">
                            <NavLink
                              to={child.to!}
                              onClick={() => isMobile && setMobileOpen(false)}
                              className={({ isActive }) =>
                                `group/sub flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 ${
                                  isActive
                                    ? "bg-gradient-to-r from-[#8B0000]/10 to-[#D4AF37]/10 text-[#8B0000] dark:text-[#D4AF37]"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200"
                                }`
                              }
                            >
                              <child.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{child.name}</span>
                              <motion.div className="ml-auto w-1 h-3 bg-gradient-to-b from-[#8B0000] to-[#D4AF37] rounded opacity-0 group-hover/sub:opacity-100" initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.2 }} />
                            </NavLink>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))}
        </motion.nav>

        {/* Profile / Sign out (sticky bottom) */}
        <motion.div
          layout
          className="sticky bottom-0 z-10 border-t border-slate-200/40 dark:border-slate-700/40
                     px-3 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
        >
          <motion.div
            layout
            className="flex items-center gap-3 cursor-pointer select-none relative"
            onClick={() => setMenuOpen((p) => !p)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] via-[#A52A2A] to-[#D4AF37]
                         flex items-center justify-center text-white font-semibold shadow-lg shadow-red-500/20 overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">{user?.firstName?.[0] || "U"}</span>
              <motion.div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
            </motion.div>

            {(!isDesktopCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.role || "User"}</p>
              </div>
            )}

            {(!isDesktopCollapsed || isMobile) && (
              <motion.div animate={{ rotate: menuOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <ChevronDown size={16} className="text-slate-400" />
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {menuOpen && (!isDesktopCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute left-3 right-3 sm:bottom-16 bottom-20
                           bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
                           border border-slate-200/50 dark:border-slate-700/50
                           rounded-2xl shadow-2xl overflow-hidden"
              >
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden">
                  <button
                    onClick={() => { navigate("/dashboard/profile"); isMobile && setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm w-full hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50 text-slate-700 dark:text-slate-200 transition-all duration-200 font-medium"
                  >
                    <UserCircle2 size={18} className="flex-shrink-0 text-slate-500" />
                    View Profile
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => { handleLogout(); isMobile && setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm w-full hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 text-red-600 dark:text-red-400 transition-all duration-200 font-medium"
                  >
                    <LogOut size={18} className="flex-shrink-0" />
                    Sign Out
                    <motion.div className="ml-auto w-1 h-4 bg-gradient-to-b from-red-500 to-red-600 rounded opacity-0" initial={{ scaleY: 0 }} whileHover={{ scaleY: 1, opacity: 1 }} transition={{ duration: 0.2 }} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapse Toggle (desktop only) */}
        <motion.button
          layout
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-slate-100/80 to-slate-200/80
                     dark:from-slate-700/80 dark:to-slate-600/80 border-2 border-slate-300/50 dark:border-slate-600/50
                     rounded-full p-2.5 hover:from-slate-200/90 hover:to-slate-300/90 dark:hover:from-slate-600/90 dark:hover:to-slate-500/90
                     backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hidden lg:block"
          whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {collapsed ? (
              <ChevronRightIcon size={16} className="text-slate-600 dark:text-slate-300" />
            ) : (
              <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
            )}
          </motion.div>
        </motion.button>
      </motion.aside>
    </>
  );
}
