// DashboardLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { motion } from "framer-motion";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  return (
    <div className="flex h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (passes a callback to open drawer on mobile) */}
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />

        {/* Content */}
        <motion.main layout className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="min-h-[calc(100dvh-14rem)]">
              <Outlet />
            </div>
          </div>
        </motion.main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}
    </div>
  );
}
