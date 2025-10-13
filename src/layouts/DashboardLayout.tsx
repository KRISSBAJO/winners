// DashboardLayout.tsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile/tablet drawer
  const location = useLocation();

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <div className="flex h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Sidebar - Now handles mobile/tablet as overlay */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (passes toggle for mobile menu) */}
        <Topbar onOpenSidebar={toggleMobile} />

        {/* Content */}
        <motion.main
          layout
          className="flex-1 overflow-y-auto"
          key={location.pathname} // Ensures re-mount on route change
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="min-h-[calc(100dvh-14rem)]">
              <Outlet />
            </div>
          </div>
        </motion.main>
      </div>

      {/* Mobile/tablet overlay - Improved with better blur and transition */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300"
            aria-label="Close sidebar overlay"
          />
        )}
      </AnimatePresence>
    </div>
  );
}