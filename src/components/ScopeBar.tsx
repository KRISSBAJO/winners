import { useAuthStore } from "../api/features/auth/store/useAuthStore";
import OrgCascader from "../components/OrgCascader";

export default function ScopeBar() {
  const { scope, setScope } = useAuthStore();
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-3 sm:p-4">
      <OrgCascader value={scope} onChange={setScope} compact />
    </div>
  );
}
