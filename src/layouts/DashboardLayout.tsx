import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { motion } from "framer-motion";
import ScopeBar from "../components/ScopeBar";

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

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar />

        {/* Content */}
        <motion.main
          layout
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
            {/* <div className="sticky top-16 z-10">
              <ScopeBar />
            </div> */}

            {/* Page outlet */}
            <div className="min-h-[calc(100vh-14rem)]">
              <Outlet />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
