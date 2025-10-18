import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, LayoutGrid, Table as TableIcon, Trash2, Edit3 } from "lucide-react";
import OrgCascader from "../../../../components/OrgCascader";
import { useOrgScopeFromAuth } from "../../../../hooks/useOrgScopeFromAuth";
import { useCells, useDeleteCell } from "../hooks/useCells";
import { useNavigate } from "react-router-dom";
import CreateEditCellModal from "../components/CreateEditCellModal";
import type { CellGroup } from "../types/cellTypes";

const BRAND = "linear-gradient(135deg,#8B0000,#D4AF37)";

type Scope = { nationalId?: string; districtId?: string; churchId?: string };
type ViewMode = "table" | "cards";

export default function CellsListPage() {

  const { value: prefill, locks } = useOrgScopeFromAuth();
  const [scope, setScope] = useState(prefill);
  useEffect(() => setScope(prefill), [prefill]);
  const nav = useNavigate();

  /* ===== Scope ===== */
 
  const { data: cells = [], isLoading } = useCells({
    nationalId: scope.nationalId,
    districtId: scope.districtId,
    churchId: scope.churchId,
  });

  const del = useDeleteCell();

  /* ===== UI state ===== */
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [view, setView] = useState<ViewMode>("table"); // default to TABLE

  /* ===== Derived ===== */
  const filtered = useMemo(() => {
    const list = cells;
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((c: CellGroup) =>
      c.name.toLowerCase().includes(q) || (c.title || "").toLowerCase().includes(q)
    );
  }, [cells, search]);

  /* ===== Handlers ===== */
  const onDelete = async (id: string, name?: string) => {
    const ok = confirm(`Delete cell${name ? ` “${name}”` : ""}? This cannot be undone.`);
    if (!ok) return;
    await del.mutateAsync(id);
  };

  return (
    <div className="relative">
      {/* Subtle brand glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20" style={{ background: BRAND }} />
        <div className="absolute -bottom-24 -right-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-10" style={{ background: BRAND }} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cell Groups
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Create and manage home cells across your organization.
          </p>
        </div>

        {/* Scope */}
        <div className="max-w-7xl mx-auto w-full">
          <OrgCascader value={scope} onChange={setScope} className="rounded-3xl" />
        </div>

        {/* Toolbar */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 justify-between">
            {/* Left: search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full border rounded-xl pl-9 pr-3 py-2.5 bg-white/90 dark:bg-slate-900/70"
                placeholder="Search by name or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Right: view toggle + primary */}
            <div className="flex items-center gap-2">
              <ViewToggle value={view} onChange={setView} />
              <button
                onClick={() => setOpenModal(true)}
                className="inline-flex items-center justify-center gap-2 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-md hover:brightness-105 transition disabled:opacity-60"
                style={{ background: BRAND }}
                disabled={!scope.churchId}
                title={!scope.churchId ? "Pick a church to create a cell" : "New Cell"}
              >
                <Plus className="w-4 h-4" />
                New Cell
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto w-full">
          {isLoading ? (
            view === "table" ? <TableSkeleton /> : <CardsSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : view === "table" ? (
            <CellsTable
              items={filtered}
              onView={(id) => nav(`/dashboard/cells/${id}`)}
              onEdit={(id) => nav(`/dashboard/cells/${id}?edit=1`)}
              onDelete={(id, name) => onDelete(id, name)}
            />
          ) : (
            <CardsGrid
              items={filtered}
              onView={(id) => nav(`/dashboard/cells/${id}`)}
              onEdit={(id) => nav(`/dashboard/cells/${id}?edit=1`)}
              onDelete={(id, name) => onDelete(id, name)}
            />
          )}
        </div>

        {/* Create/Edit modal */}
        <AnimatePresence>
          {openModal && (
            <CreateEditCellModal open={openModal} onClose={() => setOpenModal(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ================== Subcomponents ================== */

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 overflow-hidden">
      <button
        onClick={() => onChange("table")}
        className={`px-3 sm:px-4 py-2 text-sm inline-flex items-center gap-2 transition ${
          value === "table" ? "bg-slate-900 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <TableIcon className="w-4 h-4" />
        Table
      </button>
      <button
        onClick={() => onChange("cards")}
        className={`px-3 sm:px-4 py-2 text-sm inline-flex items-center gap-2 transition ${
          value === "cards" ? "bg-slate-900 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Cards
      </button>
    </div>
  );
}

/* ===== Table View (default) ===== */
function CellsTable({
  items,
  onView,
  onEdit,
  onDelete,
}: {
  items: CellGroup[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name?: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-white/10">
            <tr>
              <Th>Name</Th>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th className="text-right pr-4">Members</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-b last:border-0 border-slate-100 dark:border-white/5">
                <Td className="font-medium">{c.name}</Td>
                <Td className="text-slate-500">{c.title || "—"}</Td>
                <Td>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </Td>
                <Td className="text-right pr-4">
                  <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                    <Users className="w-4 h-4" />
                    {(c as any).members?.length ?? 0}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(c._id)}
                      className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(c._id)}
                      className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(c._id, c.name)}
                      className="text-xs px-3 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 border-red-200 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${className}`} >
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

/* ===== Cards Grid ===== */
function CardsGrid({
  items,
  onView,
  onEdit,
  onDelete,
}: {
  items: CellGroup[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name?: string) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((c) => (
        <motion.div
          key={c._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-5 flex flex-col gap-4 hover:shadow-sm transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{c.name}</h3>
              {c.title && <p className="text-sm text-slate-500 truncate">{c.title}</p>}
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
              }`}
            >
              {c.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {c.description || "—"}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <button
              onClick={() => onView(c._id)}
              className="text-sm font-medium underline underline-offset-2"
            >
              View details
            </button>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Users className="w-4 h-4" />
              <span className="text-xs">{(c as any).members?.length ?? 0} members</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => onEdit(c._id)}
              className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => onDelete(c._id, c.name)}
              className="text-xs px-3 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 border-red-200 inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ===== Skeletons / Empty ===== */
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/70">
      <div className="animate-pulse p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-200/70 dark:bg-slate-800/60 rounded" />
        ))}
      </div>
    </div>
  );
}
function CardsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl h-36 animate-pulse bg-slate-200/60 dark:bg-slate-800/60" />
      ))}
    </div>
  );
}
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center border-slate-300 dark:border-white/10 bg-white/60 dark:bg-slate-900/50">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        No cells found. Adjust the scope above or create a new cell.
      </p>
    </div>
  );
}
