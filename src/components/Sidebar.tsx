// Sidebar.tsx
import { ChevronLeft, ChevronRight as ChevronRightIcon, ChevronDown, UserCircle2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../api/features/auth/store/useAuthStore";
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
  isMobileOpen?: boolean;               // NEW
  onMobileClose?: () => void;           // NEW
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };
const submenuVariants = {
  open: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
  closed: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

export default function Sidebar({
  collapsed,
  setCollapsed,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const { clearAuth, user } = useAuthStore();
  const navigate = useNavigate();

  const isCollapsed = collapsed && !hovered;
  const navItems = roleBasedNav[user?.role || "volunteer"] as NavItem[];

  // Close drawer on route click (mobile)
  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  // Press ESC to close drawer (mobile)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen && onMobileClose) onMobileClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileOpen, onMobileClose]);

  // Desktop width animation; Mobile uses translateX slide-in
  const desktopWidth = isCollapsed ? 72 : 280;

  return (
    <>
      {/* Desktop rail (md and up) */}
      <motion.aside
        layout
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ width: desktopWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex z-30 h-dvh bg-gradient-to-b from-white/95 via-white/80 to-slate-100/70
                   dark:from-slate-900/95 dark:via-slate-800/80 dark:to-slate-700/70 backdrop-blur-3xl
                   border-r border-slate-200/50 dark:border-slate-700/40 flex-col shadow-2xl overflow-hidden"
        style={{ width: desktopWidth }}
      >
        <Header isCollapsed={isCollapsed} />
        <Nav
          items={navItems}
          isCollapsed={isCollapsed}
          openGroups={openGroups}
          setOpenGroups={setOpenGroups}
          onItemClick={handleNavClick}
        />
        <Profile
          isCollapsed={isCollapsed}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onLogout={() => {
            clearAuth();
            navigate("/login");
          }}
        />
        <CollapseButton collapsed={collapsed} setCollapsed={setCollapsed} />
      </motion.aside>

      {/* Mobile drawer (below md) */}
      <motion.aside
        initial={false}
        animate={{ x: isMobileOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="md:hidden fixed left-0 top-0 z-50 h-dvh w-72 bg-gradient-to-b from-white via-white/95 to-slate-100/80
                   dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800/80 backdrop-blur-2xl
                   border-r border-slate-200/60 dark:border-slate-700/60 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <Header isCollapsed={false} />
        <Nav
          items={navItems}
          isCollapsed={false}
          openGroups={openGroups}
          setOpenGroups={setOpenGroups}
          onItemClick={handleNavClick}
        />
        <Profile
          isCollapsed={false}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onLogout={() => {
            clearAuth();
            navigate("/login");
          }}
        />
      </motion.aside>
    </>
  );
}

/* --- Extracted pieces to keep file tidy --- */

function Header({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200/40 dark:border-slate-700/40 relative">
      <Link
        to="/"
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B0000] via-[#A52A2A] to-[#D4AF37] flex items-center justify-center text-white font-bold shadow-lg"
      >
        DC
      </Link>
      {!isCollapsed && (
        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent whitespace-nowrap tracking-tight">
          Connect Hub
        </h1>
      )}
    </div>
  );
}

function Nav({
  items,
  isCollapsed,
  openGroups,
  setOpenGroups,
  onItemClick,
}: {
  items: NavItem[];
  isCollapsed: boolean;
  openGroups: Record<string, boolean>;
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onItemClick: () => void;
}) {
  const toggleGroup = (name: string) =>
    setOpenGroups((p) => ({ ...p, [name]: !p[name] }));

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
    >
      {items.map((item) => (
        <div key={item.name} className="space-y-0.5">
          {item.type === "link" ? (
            <NavLink
              to={item.to!}
              onClick={onItemClick}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-[#8B0000]/20 to-[#D4AF37]/20 text-[#8B0000] dark:text-[#D4AF37]"
                    : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100/50 hover:to-slate-200/50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span className="flex-1 min-w-0">{item.name}</span>}
            </NavLink>
          ) : (
            <>
              <button
                onClick={() => toggleGroup(item.name)}
                className="group relative flex items-center justify-between w-full gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-left transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100/50 hover:to-slate-200/50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span className="flex-1 min-w-0">{item.name}</span>}
                </div>
                {!isCollapsed && <ChevronDown className="w-4 h-4 opacity-70" />}
              </button>
              <AnimatePresence>
                {openGroups[item.name] && !isCollapsed && (
                  <motion.ul
                    variants={submenuVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="space-y-1 overflow-hidden ml-6"
                  >
                    {item.children?.map((child) => (
                      <li key={child.name}>
                        <NavLink
                          to={child.to!}
                          onClick={onItemClick}
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-[#8B0000]/10 to-[#D4AF37]/10 text-[#8B0000] dark:text-[#D4AF37]"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200"
                            }`
                          }
                        >
                          <child.icon className="w-4 h-4" />
                          <span className="truncate">{child.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      ))}
    </motion.nav>
  );
}

function Profile({
  isCollapsed,
  menuOpen,
  setMenuOpen,
  onLogout,
}: {
  isCollapsed: boolean;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <div className="relative border-t border-slate-200/40 dark:border-slate-700/40 px-3 py-4 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-800/30">
      <div
        className="flex items-center gap-3 cursor-pointer select-none relative"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] via-[#A52A2A] to-[#D4AF37] flex items-center justify-center text-white font-semibold">
          {/* initial */}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-sm font-semibold">Profile</p>
            <p className="text-xs text-slate-500">Settings & sign out</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute bottom-16 left-3 right-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm w-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollapseButton({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center
                 bg-white/80 dark:bg-slate-700/80 border-2 border-slate-300/50 dark:border-slate-600/50
                 rounded-full p-2.5 shadow-lg hover:shadow-xl transition"
      aria-label="Toggle collapse"
    >
      {collapsed ? <ChevronRightIcon size={16} /> : <ChevronLeft size={16} />}
    </button>
  );
}
