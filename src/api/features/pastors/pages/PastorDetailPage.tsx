import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Loader2, User, Calendar, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useDeletePastor, usePastor, useUpdatePastor } from "../hooks";
import PastorForm from "../components/PastorForm";
import AssignmentList from "../components/AssignmentList";
import AssignmentForm from "../components/AssignmentForm";

export default function PastorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const { data, isLoading, error } = usePastor(id);
  const update = useUpdatePastor(id || "");
  const del = useDeletePastor();

  if (!id) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">Invalid Pastor ID</div>
        <button onClick={() => nav("/pastors")} className="text-blue-600 hover:underline">
          Back to Pastors
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="space-y-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            </div>
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border p-4 bg-white dark:bg-slate-900">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-4 text-center">
        <div className="text-red-600 mb-2">Failed to load pastor details</div>
        <button 
          onClick={() => nav("/pastors")} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pastors
        </button>
      </div>
    );
  }

  const onSave = async (v: any) => {
    update.mutate(v, {
      onSuccess: () => toast.success("Pastor updated successfully"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update pastor"),
    });
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete pastor "${data.firstName} ${data.lastName}"? This action cannot be undone.`)) return;
    del.mutate(id, {
      onSuccess: () => {
        toast.success("Pastor deleted");
        nav("/pastors");
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete pastor"),
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 space-y-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-white/10 p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => nav("/pastors")} 
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.firstName} {data.lastName}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{data.email}</p>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDelete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete Pastor
        </motion.button>
      </motion.header>

      {/* Basic Info */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h2>
        </div>
        <PastorForm 
          initial={data} 
          onSubmit={onSave} 
          submitting={update.isPending} 
        />
        {update.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </motion.div>
        )}
      </motion.section>

      {/* Assignments */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <motion.div
          className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Assignment History</h2>
          </div>
          <AssignmentList pastorId={id} />
        </motion.div>

        <motion.div
          className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New Assignment</h2>
          </div>
          <AssignmentForm pastorId={id} />
        </motion.div>
      </motion.section>
    </motion.div>
  );
}