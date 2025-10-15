import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users } from "lucide-react";
import OrgCascader from "../../../../components/OrgCascader";
import { useCells, useDeleteCell } from "../hooks/useCells";
import { useNavigate } from "react-router-dom";
import CreateEditCellModal from "../components/CreateEditCellModal";
import type { CellGroup } from "../types/cellTypes";

const BRAND = "linear-gradient(135deg,#8B0000,#D4AF37)";

type Scope = { nationalId?: string; districtId?: string; churchId?: string };

export default function CellsListPage() {
  const nav = useNavigate();

  // full tri-scope
  const [scope, setScope] = useState<Scope>({});
  const { data: cells = [], isLoading } = useCells({
    nationalId: scope.nationalId,      // UI keeps using nationalId
    districtId: scope.districtId,
    churchId: scope.churchId,
  });

  const del = useDeleteCell();

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return cells;
    const q = search.toLowerCase();
    return cells.filter((c: CellGroup) =>
      c.name.toLowerCase().includes(q) || (c.title || "").toLowerCase().includes(q)
    );
  }, [cells, search]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page header */}
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cell Groups
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Create and manage home cells across your organization.
        </p>
      </div>

      {/* Scope picker – WIDE, comfy, not compact */}
      <div className="max-w-7xl mx-auto w-full">
        <OrgCascader
          value={scope}
          onChange={setScope}
          className="rounded-3xl"
          // key tweak: not compact -> more breathing room
        />
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full border rounded-xl pl-9 pr-3 py-2.5 bg-white/90 dark:bg-slate-900/70"
              placeholder="Search by name or title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Primary action */}
          <button
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-xl shadow-md hover:brightness-105 transition"
            style={{ background: BRAND }}
            disabled={!scope.churchId}
            title={!scope.churchId ? "Pick a church in the scope above to create a cell" : "New Cell"}
          >
            <Plus className="w-4 h-4" />
            New Cell
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl h-36 animate-pulse bg-slate-200/60 dark:bg-slate-800/60"
                />
              ))
            : filtered.map((c: CellGroup) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-5 flex flex-col gap-4 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg truncate">{c.name}</h3>
                      {c.title && (
                        <p className="text-sm text-slate-500 truncate">{c.title}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                        c.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {c.description || "—"}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => nav(`/dashboard/cells/${c._id}`)}
                      className="text-sm font-medium underline underline-offset-2"
                    >
                      View details
                    </button>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">
                        {(c as any).members?.length ?? 0} members
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => nav(`/dashboard/cells/${c._id}?edit=1`)}
                      className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await del.mutateAsync(c._id);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>

      {/* Create */}
      <AnimatePresence>
        {openModal && (
          <CreateEditCellModal open={openModal} onClose={() => setOpenModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
