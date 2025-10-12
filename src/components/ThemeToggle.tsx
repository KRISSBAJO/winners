import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { motion } from "framer-motion";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        pinned={pinned}
        setPinned={setPinned}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <motion.main
          layout
          className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-white/40 to-slate-100/30 dark:from-slate-900/40 dark:to-slate-950/60 backdrop-blur-lg"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
