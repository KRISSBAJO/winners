// src/features/members/MembershipPage.tsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Users2, Plus } from "lucide-react";
import { useAuthStore } from "../../../../api/features/auth/store/useAuthStore";
import {
  useMembers, useMembersByChurch, useMembersByDistrict, useMembersByNational,
  useDeleteMember, useCreateMember, useUpdateMember,
} from "../hooks/useMembers";
import type { Member, MembershipStatus } from "../types/memberTypes";

import MembersTable from "../components/MembersTable";
import FiltersDrawer from "../components/FiltersDrawer";
import { MemberModal } from "../components/Modals";

export default function MembershipPage() {
  const { scope, setScope } = useAuthStore();

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [selectedScope, setSelectedScope] = useState(scope);
  const [status, setStatus] = useState<MembershipStatus | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [search, setSearch] = useState("");

  useEffect(() => setScope(selectedScope), [selectedScope, setScope]);

  const enableChurch   = !!selectedScope.churchId;
  const enableDistrict = !!selectedScope.districtId && !selectedScope.churchId;
  const enableNational = !!selectedScope.nationalChurchId && !selectedScope.districtId && !selectedScope.churchId;

  const baseList   = useMembers(status ? { membershipStatus: status } : undefined);
  const byChurch   = useMembersByChurch(enableChurch ? selectedScope.churchId : undefined);
  const byDistrict = useMembersByDistrict(enableDistrict ? selectedScope.districtId : undefined);
  const byNational = useMembersByNational(enableNational ? selectedScope.nationalChurchId : undefined);

  const isLoading =
    baseList.isLoading || byChurch.isLoading || byDistrict.isLoading || byNational.isLoading;

  const error =
    (baseList.isError && baseList.error) ||
    (byChurch.isError && byChurch.error) ||
    (byDistrict.isError && byDistrict.error) ||
    (byNational.isError && byNational.error);

  const dataRaw: Member[] = useMemo(() => {
    if (enableChurch)  return byChurch.data ?? [];
    if (enableDistrict) return byDistrict.data ?? [];
    if (enableNational) return byNational.data ?? [];
    return baseList.data ?? [];
  }, [enableChurch, enableDistrict, enableNational, byChurch.data, byDistrict.data, byNational.data, baseList.data]);

  const members = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dataRaw;
    return dataRaw.filter((m) =>
      [m.firstName, m.middleName, m.lastName, m.email, m.phone, typeof m.churchId === "object" ? (m.churchId as any)?.name : ""]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [dataRaw, search]);

  // CRUD modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const create = useCreateMember();
  const update = useUpdateMember(editing?._id ?? "");
  const remove = useDeleteMember();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex gap-2 text-slate-900 dark:text-white">
            <Users2 className="w-5 h-5 text-amber-600" /> Membership
          </h1>
          <p className="text-sm text-slate-500">Directory, uploads, invites & more.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-50/60 dark:hover:bg-white/10"
            title="Filters and actions"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white shadow-md"
            style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      {/* Main: TABLE dominates the page */}
      <MembersTable
        members={members}
        isLoading={isLoading}
        error={error as any}
        onEdit={(m) => { setEditing(m); setModalOpen(true); }}
        onDelete={(id) => remove.mutate(id)}
      />

      {/* Drawer holds scope, filters, stats, uploads & invites */}
      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedScope={selectedScope}
        onScopeChange={setSelectedScope}
        status={status}
        onStatusChange={setStatus}
        month={month}
        onMonthChange={setMonth}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Create/Edit modal */}
      <MemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        selectedScope={{ churchId: selectedScope.churchId }}
        saving={create.isPending || update.isPending}
        onSubmit={async (payload) => {
          if (editing) await update.mutateAsync(payload);
          else await create.mutateAsync(payload as any);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
