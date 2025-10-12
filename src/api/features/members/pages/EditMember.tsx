import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMember, useUpdateMember } from "../hooks/useMembers";
import { useGroupsByChurch, useAssignLeader } from "../../volunteerGroups/hooks/useVolunteerGroups";
import type { Member, UpdateMemberInput } from "../types/memberTypes";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  User,
  AtSign,
  Phone,
  Calendar,
  Users,
  CheckSquare,
  Mail,
  MapPin,
  Heart,
  Crown,
  Zap,
  Edit3,
  Image,
  FileText,
  Loader2,
  BadgeCheck,
  X,
} from "lucide-react";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const inputVariants = {
  focus: { scale: 1.02, boxShadow: "0 0 0 3px rgba(139, 0, 0, 0.1)" },
  hover: { scale: 1.01 },
};

export default function EditMember() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data: member, isLoading, isError } = useMember(id);
  const update = useUpdateMember(id || "");
  const [form, setForm] = useState<Partial<UpdateMemberInput>>({});
  const assignLeader = useAssignLeader();

  // load groups by member's church
  const churchId =
    typeof member?.churchId === "string" ? member?.churchId : (member?.churchId as any)?._id;
  const { data: groups = [] } = useGroupsByChurch(churchId);

  useEffect(() => {
    if (member) {
      setForm({
        firstName: member.firstName,
        middleName: member.middleName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        altPhone: member.altPhone,
        gender: member.gender,
        dob: member.dob ? new Date(member.dob) : undefined,
        maritalStatus: member.maritalStatus,
        spouseName: member.spouseName,
        weddingAnniversary: member.weddingAnniversary ? new Date(member.weddingAnniversary) : undefined,
        address: member.address || {},
        salvationDate: member.salvationDate ? new Date(member.salvationDate) : undefined,
        baptismDate: member.baptismDate ? new Date(member.baptismDate) : undefined,
        holyGhostBaptism: member.holyGhostBaptism,
        membershipStatus: member.membershipStatus,
        joinDate: member.joinDate ? new Date(member.joinDate) : undefined,
        invitedBy: member.invitedBy,
        role: member.role,
        volunteerGroups: member.volunteerGroups || [],
        isLeader: member.isLeader,
        familyId: member.familyId,
        household: member.household || {},
        photoUrl: member.photoUrl,
        notes: member.notes,
      });
    }
  }, [member]);

  const submitting = update.isPending || assignLeader.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await update.mutateAsync(form);
      toast.success("Member updated successfully!");
      nav(-1);
    } catch (err) {
      toast.error("Failed to save changes.");
    }
  };

  const toggleGroup = (gid: string) => {
    setForm((p) => {
      const set = new Set(p.volunteerGroups || []);
      set.has(gid) ? set.delete(gid) : set.add(gid);
      return { ...p, volunteerGroups: Array.from(set) };
    });
  };

  const makeLeader = async (groupId: string) => {
    if (!id) return;
    try {
      await assignLeader.mutateAsync({ groupId, leaderId: id });
      toast.success(`Assigned as leader of "${groups.find(g => g._id === groupId)?.name}"`);
    } catch (err) {
      toast.error("Failed to assign leadership.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-200 to-yellow-50 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-[#8B0000] animate-spin" />
          <p className="text-slate-600 dark:text-slate-300">Loading member details...</p>
        </motion.div>
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm shadow-xl"
        >
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Oops!</h2>
          <p className="text-slate-600 dark:text-slate-400">Couldn’t load member details. <button onClick={() => nav(-1)} className="text-[#8B0000] hover:underline">Go back</button></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-6 rounded-md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Members
          </motion.button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-amber-500/20 px-4 py-2 rounded-full border border-amber-200/50 text-sm font-medium text-amber-700 dark:text-amber-300"
          >
            <BadgeCheck className="w-4 h-4" />
            Member ID: {member._id}
          </motion.div>
        </motion.header>

        {/* Form */}
        <motion.form
          onSubmit={onSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Identity */}
          <Section title="Personal Identity" icon={<User className="w-4 h-4 text-blue-500" />} index={0}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FancyInput
                label="First Name"
                icon={<User className="w-4 h-4 text-slate-400" />}
                value={form.firstName || ""}
                onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
                placeholder="Enter first name"
              />
              <FancyInput
                label="Middle Name"
                icon={<User className="w-4 h-4 text-slate-400" />}
                value={form.middleName || ""}
                onChange={(v) => setForm((p) => ({ ...p, middleName: v }))}
                placeholder="Enter middle name"
              />
              <FancyInput
                label="Last Name"
                icon={<User className="w-4 h-4 text-slate-400" />}
                value={form.lastName || ""}
                onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
                placeholder="Enter last name"
              />
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact Information" icon={<AtSign className="w-4 h-4 text-green-500" />} index={1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FancyInput
                label="Email Address"
                type="email"
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                value={form.email || ""}
                onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                placeholder="user@example.com"
              />
              <FancyInput
                label="Primary Phone"
                type="tel"
                icon={<Phone className="w-4 h-4 text-slate-400" />}
                value={form.phone || ""}
                onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                placeholder="+1 (555) 123-4567"
              />
              <FancyInput
                label="Alternate Phone"
                type="tel"
                icon={<Phone className="w-4 h-4 text-slate-400" />}
                value={form.altPhone || ""}
                onChange={(v) => setForm((p) => ({ ...p, altPhone: v }))}
                placeholder="Alternate number"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <FancyInput
                label="Street Address"
                icon={<MapPin className="w-4 h-4 text-slate-400" />}
                value={form.address?.street || ""}
                onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address || {}), street: v } }))}
                placeholder="123 Main St"
              />
              <FancyInput
                label="City"
                value={form.address?.city || ""}
                onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address || {}), city: v } }))}
                placeholder="City"
              />
              <FancyInput
                label="State/Province"
                value={form.address?.state || ""}
                onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address || {}), state: v } }))}
                placeholder="State"
              />
              <FancyInput
                label="Country"
                value={form.address?.country || ""}
                onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address || {}), country: v } }))}
                placeholder="Country"
              />
              <FancyInput
                label="ZIP/Postal Code"
                value={form.address?.zip || ""}
                onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address || {}), zip: v } }))}
                placeholder="12345"
              />
            </div>
          </Section>

          {/* Spiritual & Membership */}
          <Section title="Spiritual Journey & Membership" icon={<Heart className="w-4 h-4 text-purple-500" />} index={2}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <FancySelect
                label="Gender"
                value={form.gender || ""}
                onChange={(v) => setForm((p) => ({ ...p, gender: (v || undefined) as any }))}
                options={[
                  { label: "Select Gender", value: "" },
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]}
                icon={<User className="w-4 h-4 text-slate-400" />}
              />
              <FancySelect
                label="Membership Status"
                value={form.membershipStatus || "Active"}
                onChange={(v) => setForm((p) => ({ ...p, membershipStatus: v as any }))}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Visitor", value: "Visitor" },
                  { label: "New Convert", value: "New Convert" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                icon={<BadgeCheck className="w-4 h-4 text-slate-400" />}
              />
              <FancyDate
                label="Join Date"
                value={form.joinDate}
                onChange={(v) => setForm((p) => ({ ...p, joinDate: v }))}
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
              />
              <FancyInput
                label="Role/Position"
                value={form.role || ""}
                onChange={(v) => setForm((p) => ({ ...p, role: v }))}
                placeholder="e.g., Elder, Deacon"
                icon={<Crown className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FancyDate
                label="Salvation Date"
                value={form.salvationDate}
                onChange={(v) => setForm((p) => ({ ...p, salvationDate: v }))}
                icon={<Heart className="w-4 h-4 text-slate-400" />}
              />
              <FancyDate
                label="Baptism Date"
                value={form.baptismDate}
                onChange={(v) => setForm((p) => ({ ...p, baptismDate: v }))}
                icon={<Zap className="w-4 h-4 text-slate-400" />}
              />
              <FancyCheckbox
                label="Holy Ghost Baptism"
                checked={!!form.holyGhostBaptism}
                onChange={(v) => setForm((p) => ({ ...p, holyGhostBaptism: v }))}
                icon={<Zap className="w-4 h-4 text-purple-400" />}
              />
            </div>
          </Section>

          {/* Family */}
          <Section title="Family Details" icon={<Users className="w-4 h-4 text-pink-500" />} index={3}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FancySelect
                label="Marital Status"
                value={form.maritalStatus || ""}
                onChange={(v) => setForm((p) => ({ ...p, maritalStatus: (v || undefined) as any }))}
                options={[
                  { label: "Select Status", value: "" },
                  { label: "Single", value: "Single" },
                  { label: "Married", value: "Married" },
                  { label: "Divorced", value: "Divorced" },
                  { label: "Widowed", value: "Widowed" },
                ]}
                icon={<Users className="w-4 h-4 text-slate-400" />}
              />
              <FancyInput
                label="Spouse Name"
                value={form.spouseName || ""}
                onChange={(v) => setForm((p) => ({ ...p, spouseName: v }))}
                placeholder="Full name of spouse"
                icon={<Users className="w-4 h-4 text-slate-400" />}
              />
              <FancyDate
                label="Wedding Anniversary"
                value={form.weddingAnniversary}
                onChange={(v) => setForm((p) => ({ ...p, weddingAnniversary: v }))}
                icon={<Heart className="w-4 h-4 text-slate-400" />}
              />
              <FancyInput
                label="Family ID"
                value={form.familyId || ""}
                onChange={(v) => setForm((p) => ({ ...p, familyId: v }))}
                placeholder="Family group ID"
                icon={<Users className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </Section>

          {/* Volunteer Groups */}
          <Section title="Volunteer Groups & Leadership" icon={<CheckSquare className="w-4 h-4 text-amber-500" />} index={4}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = (form.volunteerGroups || []).includes(g._id);
                  return (
                    <motion.button
                      key={g._id}
                      type="button"
                      onClick={() => toggleGroup(g._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                        active
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-200/50"
                          : "bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {active ? <CheckSquare className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {g.name}
                    </motion.button>
                  );
                })}
              </div>
              {groups.length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-4">No volunteer groups available for this church.</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                {groups.map((g) => (
                  <motion.button
                    key={`lead-${g._id}`}
                    type="button"
                    onClick={() => makeLeader(g._id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-600/50 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600/50 dark:hover:to-slate-500/50 transition-all disabled:opacity-50"
                  >
                    <Crown className="w-3 h-3" />
                    Leader: {g.name}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">Toggle groups to add/remove membership. Assign leadership with buttons above.</p>
            </div>
          </Section>

          {/* Notes */}
          <Section title="Additional Notes" icon={<FileText className="w-4 h-4 text-gray-500" />} index={5}>
            <FancyTextarea
              value={form.notes || ""}
              onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
              placeholder="Enter any additional notes or comments..."
              icon={<Edit3 className="w-4 h-4 text-slate-400 absolute left-3 top-3 opacity-50" />}
            />
          </Section>

          {/* Photo Placeholder (Optional Enhancement) */}
          <Section title="Profile Photo" icon={<Image className="w-4 h-4 text-indigo-500" />} index={6}>
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-200/50 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Upload or update profile photo</p>
                <p className="text-xs mt-1">Current: {member.photoUrl ? "Uploaded" : "None"}</p>
              </div>
            </div>
          </Section>

          {/* Submit */}
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-end pt-4"
          >
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed disabled:shadow-md"
              style={{
                background: submitting
                  ? "linear-gradient(135deg, #6B7280, #9CA3AF)"
                  : "linear-gradient(135deg, #8B0000, #D4AF37)",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </motion.footer>
        </motion.form>
      </motion.div>
    </div>
  );
}

/* ------- Enhanced UI Components ------- */

function Section({
  title,
  icon,
  children,
  index,
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/40 dark:border-slate-700/40 shadow-sm hover:shadow-md transition-all duration-300 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 dark:via-slate-900/20 to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function FancyInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block relative space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <motion.div
        className="relative"
        variants={inputVariants}
        whileFocus="focus"
        whileHover="hover"
      >
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </motion.div>
    </label>
  );
}

function FancySelect({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <label className="block relative space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <motion.div
        className="relative"
        variants={inputVariants}
        whileFocus="focus"
        whileHover="hover"
      >
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
          ▼
        </div>
      </motion.div>
    </label>
  );
}

function FancyDate({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value?: Date | string;
  onChange: (v?: Date) => void;
  icon?: React.ReactNode;
}) {
  const str = useMemo(() => (value ? new Date(value).toISOString().slice(0, 10) : ""), [value]);
  return (
    <label className="block relative space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <motion.div
        className="relative"
        variants={inputVariants}
        whileFocus="focus"
        whileHover="hover"
      >
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type="date"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200"
          value={str}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
        />
      </motion.div>
    </label>
  );
}

function FancyCheckbox({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <motion.label
      className="inline-flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && <div className="opacity-50">{icon}</div>}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 text-[#8B0000] bg-white/50 dark:bg-slate-700/30 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-[#8B0000] focus:ring-2 transition-all"
      />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </motion.label>
  );
}

function FancyTextarea({
  value,
  onChange,
  placeholder,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative"
      variants={inputVariants}
      whileFocus="focus"
      whileHover="hover"
    >
      {icon}
      <textarea
        className="w-full pl-10 pt-10 pr-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200 resize-none"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </motion.div>
  );
}