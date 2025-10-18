// src/api/features/delegations/pages/DelegationsPage.tsx
import { useMemo, useState } from "react";
import { useCreateDelegation, useMyDelegations, useRevokeDelegation } from "../hooks";
import OrgCascader from "../../../../components/OrgCascader";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, UserPlus, XCircle } from "lucide-react";
import { useUsersByChurch } from "../../../features/users/hooks/useUsersByChurch";
import { useAuthStore } from "../../../features/auth/store/useAuthStore";

const BRAND = "linear-gradient(135deg,#8B0000,#D4AF37)";

type Scope = { nationalId?: string; districtId?: string; churchId?: string };

export default function DelegationsPage() {
  const { user } = useAuthStore();
  const [scope, setScope] = useState<Scope>({});
  const [granteeId, setGranteeId] = useState("");
  const [startsAt, setStartsAt] = useState(() => {
    // local-friendly default for datetime-local
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [endsAt, setEndsAt] = useState(() => {
    const d = new Date(Date.now() + 7 * 864e5);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [mode, setMode] = useState<"role" | "perms">("role");
  const [roleLike, setRoleLike] = useState("districtPastor");
  const [perms, setPerms] = useState<string>("");
  const [reason, setReason] = useState("");

  // ✅ Infinite hook auto-disables when churchId is falsy (it already uses enabled: !!churchId internally)
  const usersQ = useUsersByChurch(scope.churchId, "", 30);

  // ✅ Flatten pages → array
  const users = useMemo(
    () => (usersQ.data?.pages ?? []).flatMap((p) => p.items),
    [usersQ.data]
  );

  const create = useCreateDelegation();
  const myAsGrantor = useMyDelegations("grantor");
  const revoke = useRevokeDelegation();

  const submit = async () => {
    const payload: any = {
      granteeId,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      reason,
      scope: {
        nationalChurchId: scope.nationalId || undefined,
        districtId: scope.districtId || undefined,
        churchId: scope.churchId || undefined,
      },
    };
    if (mode === "role") payload.roleLike = roleLike;
    else payload.permissions = perms.split(",").map((s) => s.trim()).filter(Boolean);

    await create.mutateAsync(payload);
    setReason("");
    setPerms("");
  };

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Delegations</h1>
          <p className="text-sm text-slate-500">
            Create temporary “acting” access for assistants or coverage.
          </p>
        </div>
      </header>

      {/* Create */}
      <div className="rounded-2xl border p-4 bg-white/90 dark:bg-slate-900/70">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> New Delegation
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <OrgCascader value={scope} onChange={setScope as any} />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Grantee (user)</label>
            <select
              value={granteeId}
              onChange={(e) => setGranteeId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              disabled={!scope.churchId || usersQ.isLoading}
            >
              <option value="">{usersQ.isLoading ? "Loading…" : "Select user…"}</option>
              {users.map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName} — {u.email}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">
                <span className="font-medium">Starts</span>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Ends</span>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
            </div>

            <div className="flex gap-3 items-center">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={mode === "role"} onChange={() => setMode("role")} />
                Use role-like
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={mode === "perms"} onChange={() => setMode("perms")} />
                Custom permissions
              </label>
            </div>

            {mode === "role" ? (
              <label className="block text-sm">
                <span className="font-medium">Role-like</span>
                <select
                  value={roleLike}
                  onChange={(e) => setRoleLike(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="districtPastor">districtPastor</option>
                  <option value="nationalPastor">nationalPastor</option>
                  <option value="churchAdmin">churchAdmin</option>
                  <option value="pastor">pastor</option>
                </select>
              </label>
            ) : (
              <label className="block text-sm">
                <span className="font-medium">Permissions (comma-separated)</span>
                <input
                  value={perms}
                  onChange={(e) => setPerms(e.target.value)}
                  placeholder="attendance.read, member.read, event.create"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
            )}

            <label className="block text-sm">
              <span className="font-medium">Reason (optional)</span>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </label>

            <button
              onClick={submit}
              disabled={create.isPending || !granteeId}
              className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg"
              style={{ background: BRAND }}
            >
              <ShieldCheck className="w-4 h-4" /> Create delegation
            </button>
          </div>
        </div>
      </div>

      {/* Mine (as grantor) */}
      <div className="rounded-2xl border p-4 bg-white/90 dark:bg-slate-900/70">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> My Delegations
        </h2>
        <ul className="space-y-3">
          {(myAsGrantor.data ?? []).map((d) => {
            const now = new Date();
            const active = !d.isRevoked && new Date(d.startsAt) <= now && new Date(d.endsAt) >= now;
            return (
              <motion.li
                key={d._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border p-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm">
                    <span className="font-semibold">
                      {d.granteeId?.firstName} {d.granteeId?.lastName}
                    </span>{" "}
                    gets {d.roleLike ? `role ${d.roleLike}` : `${(d.permissions || []).length} permissions`}
                  </div>
                  <div className="text-xs text-slate-500">
                    {d.scope?.nationalChurchId ? `Nat:` : ""}{String(d.scope?.nationalChurchId || "")}{" "}
                    {d.scope?.districtId ? ` Dist:` : ""}{String(d.scope?.districtId || "")}{" "}
                    {d.scope?.churchId ? ` Ch:` : ""}{String(d.scope?.churchId || "")}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(d.startsAt).toLocaleString()} → {new Date(d.endsAt).toLocaleString()}{" "}
                    {active ? "• Active" : "• Inactive"}
                  </div>
                  {d.reason && <div className="text-xs text-slate-500">Reason: {d.reason}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => revoke.mutate(d._id)}
                    className="text-xs px-3 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 border-red-200 inline-flex items-center gap-1"
                    disabled={revoke.isPending || d.isRevoked}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Revoke
                  </button>
                </div>
              </motion.li>
            );
          })}
          {(!myAsGrantor.data || myAsGrantor.data.length === 0) && (
            <li className="text-sm text-slate-500">No delegations yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
