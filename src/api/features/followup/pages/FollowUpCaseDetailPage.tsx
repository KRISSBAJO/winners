import { useParams, useNavigate } from "react-router-dom";
import { useFollowup, useAttempts, useAssignCase, useCaseAction } from "../hooks/useFollowup";
import type { AttemptOutcome, AttemptChannel } from "../types/followupTypes";
import LogAttemptModal from "../components/LogAttemptModal";
import ConsentPills from "../components/ConsentPills";
import CadenceAssign from "../components/CadenceAssign";
import { useState } from "react";
import { gradient } from "../ui/theme";
import AssigneePicker from "../components/AssigneePicker";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pause,
  Play,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  CalendarCheck,
  UserCheck,
  Loader2,
  Sparkles,
  Users
} from "lucide-react";
import { Badge } from "../../../../components/ui/Badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../../components/ui/Tooltip";
import { cn } from "../../../../utils/utils";
import TagsEditor from "../components/TagsEditor";


const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FollowUpCaseDetailPage() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { data: c, isLoading: caseLoading } = useFollowup(id);
  const attempts = useAttempts(id);
  const assign = useAssignCase(id);
  const actions = useCaseAction(id);
  const [openLog, setOpenLog] = useState(false);
  const [assignee, setAssignee] = useState<string>("");

  if (caseLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex flex-col items-center gap-4 text-slate-600 dark:text-slate-300"
        >
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p>Loading case details...</p>
        </motion.div>
      </div>
    );
  }

  if (!c) return <div className="p-6 text-red-500">Case not found.</div>;

  const person =
    c.memberId && typeof c.memberId !== "string"
      ? `${c.memberId.firstName} ${c.memberId.lastName}`
      : c.prospect
      ? `${c.prospect.firstName} ${c.prospect.lastName ?? ""}`
      : "—";

  const statusColor = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    paused: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    resolved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  }[c.status] || "bg-gray-100 text-gray-800";

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <div className="min-h-screen bg-white dark:from-slate-950 to-slate-900 p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Header */}
          <motion.header
            className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-md border border-slate-200/50 dark:border-slate-700/50"
            variants={variants}
          >
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => nav(-1)}
                    className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Back to cases</TooltipContent>
              </Tooltip>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{person}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                  <Badge className={cn("text-xs", statusColor)}>{c.status.replace("_", " ")}</Badge>
                  <span>•</span>
                  <span className="font-medium">{c.type}</span>
                  <span>•</span>
                  <Badge variant="outline" className="flex items-center gap-1 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                    <Sparkles className="w-3 h-3" />
                    Score: {c.engagementScore}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setOpenLog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-md hover:shadow-lg transition"
                    style={{ background: gradient }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Log</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Log attempt</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => (c.status !== "paused" ? actions.pause.mutate(c._id) : actions.resume.mutate())}
                    disabled={actions.pause.isPending || actions.resume.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition disabled:opacity-50"
                  >
                    {c.status !== "paused" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="hidden sm:inline">{c.status !== "paused" ? "Pause" : "Resume"}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{c.status !== "paused" ? "Pause case" : "Resume case"}</TooltipContent>
              </Tooltip>
              {c.status !== "resolved" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => actions.resolve.mutate(c._id)}
                      disabled={actions.resolve.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-green-200 dark:border-green-800 hover:bg-green-100/50 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Resolve</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Mark as resolved</TooltipContent>
                </Tooltip>
              )}
            </div>
          </motion.header>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Key Actions */}
            <motion.div variants={variants} className="space-y-6">
              <Card title="Consent" icon={<UserCheck className="w-5 h-5 text-blue-500" />}>
                <ConsentPills caseId={c._id} consent={c.consent} />
              </Card>

              <Card title="Assignment" icon={<Users className="w-5 h-5 text-indigo-500" />}>
                <div className="flex gap-3">
                  <AssigneePicker
                    churchId={c.churchId}
                    value={assignee}
                    onChange={(userId) => setAssignee(userId || "")}
                    className="flex-1"
                  />
                  <button
                    onClick={() => assign.mutate(assignee || null)}
                    disabled={assign.isPending || !assignee}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition disabled:opacity-50"
                  >
                    {assign.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
                  </button>
                </div>
              </Card>

              <Card title="Cadence" icon={<CalendarCheck className="w-5 h-5 text-amber-500" />}>
                <CadenceAssign caseId={c._id} currentCadenceId={c.cadenceId} />
              </Card>
            </motion.div>

            {/* Right Column: Attempts Timeline */}
            <motion.div variants={variants} className="md:col-span-1">
              <Card title="Contact Attempts" icon={<MessageSquare className="w-5 h-5 text-green-500" />}>
                <div className="max-h-[600px] overflow-y-auto rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">When</th>
                        <th className="px-4 py-3 text-left font-medium">Channel</th>
                        <th className="px-4 py-3 text-left font-medium">Outcome</th>
                        <th className="px-4 py-3 text-left font-medium">Next</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {attempts.isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                            Loading attempts...
                          </td>
                        </tr>
                      ) : attempts.data?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                            No attempts yet.
                          </td>
                        </tr>
                      ) : (
                        attempts.data?.map((a, i) => (
                          <motion.tr
                            key={a._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                          >
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {new Date(a.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs flex items-center">
                                {a.channel === ("phone" as AttemptChannel) && <Phone className="w-3 h-3 mr-1" />}
                                {a.channel === "email" && <Mail className="w-3 h-3 mr-1" />}
                                {a.channel === "sms" && <MessageSquare className="w-3 h-3 mr-1" />}
                                {a.channel}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={cn(
                                  "text-xs",
                                  a.outcome === ("reached" as AttemptOutcome) && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                                  a.outcome === ("no_response" as AttemptOutcome) && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
                                  a.outcome === ("declined" as AttemptOutcome) && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                )}
                              >
                                {a.outcome.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {a.nextActionOn ? new Date(a.nextActionOn).toLocaleString() : "—"}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {(attempts.data ?? []).length > 0 && (
                  <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                    {(attempts.data ?? []).length} attempts logged
                  </div>
                )}
              </Card>
              <div className="mt-4 border" />
              <div className="mt-4 shadow-sm p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/70 backdrop-blur-md">
                <h4 className="font-semibold text-sm mt-4">Tags</h4>
                <TagsEditor caseId={c._id} tags={c.tags} />
              </div>
            </motion.div>
          </div>
         

      
        </motion.div>

        <LogAttemptModal open={openLog} onClose={() => setOpenLog(false)} caseId={c._id} />
      </div>
    </TooltipProvider>
  );
}

/* ------- Enhanced UI Components ------- */

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="rounded-2xl bg-white/80 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
