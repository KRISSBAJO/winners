import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useBeforeUnload } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMember, useUpdateMember } from "../hooks/useMembers";
import { useGroupsByChurch, useAssignLeader } from "../../volunteerGroups/hooks/useVolunteerGroups";
import { FancyCheckbox, FancyInput, FancySelect, FancyDate,  FancyTextarea

 } from "../../../../components/ui/Fancy";
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
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
});

const childSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dob: z.date().optional(),
});

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dob: z.date().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  address: addressSchema.optional(),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]).optional(),
  spouseName: z.string().optional(),
  weddingAnniversary: z.date().optional(),
  salvationDate: z.date().optional(),
  baptismDate: z.date().optional(),
  holyGhostBaptism: z.boolean().optional(),
  membershipStatus: z.enum(["Active", "Visitor", "New Convert", "Inactive"]),
  joinDate: z.date().optional(),
  invitedBy: z.string().optional(),
  role: z.string().optional(),
  volunteerGroups: z.array(z.string()).optional(),
  isLeader: z.boolean().optional(),
  familyId: z.string().optional(),
  household: z.object({
    spouse: z.string().optional(),
    children: z.array(childSchema).optional(),
    dependents: z.array(z.string()).optional(),
  }).optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditMember() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data: member, isLoading, isError } = useMember(id);
  const update = useUpdateMember(id || "");
  const assignLeader = useAssignLeader();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const reduce = useReducedMotion();

  // load groups by member's church
  const churchId =
    typeof member?.churchId === "string" ? member?.churchId : (member?.churchId as any)?._id;
  const { data: groups = [] } = useGroupsByChurch(churchId);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, control, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      gender: undefined,
      dob: undefined,
      email: "",
      phone: "",
      altPhone: "",
      address: {},
      maritalStatus: undefined,
      spouseName: "",
      weddingAnniversary: undefined,
      salvationDate: undefined,
      baptismDate: undefined,
      holyGhostBaptism: false,
      membershipStatus: "Active",
      joinDate: undefined,
      invitedBy: "",
      role: "",
      volunteerGroups: [],
      isLeader: false,
      familyId: "",
      household: {
        spouse: "",
        children: [],
        dependents: [],
      },
      photoUrl: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "household.children",
  });

  useEffect(() => {
    if (member) {
      reset({
        firstName: member.firstName,
        middleName: member.middleName || "",
        lastName: member.lastName,
        gender: member.gender,
        dob: member.dob ? new Date(member.dob) : undefined,
        email: member.email || "",
        phone: member.phone || "",
        altPhone: member.altPhone || "",
        address: member.address || {},
        maritalStatus: member.maritalStatus,
        spouseName: member.spouseName || "",
        weddingAnniversary: member.weddingAnniversary ? new Date(member.weddingAnniversary) : undefined,
        salvationDate: member.salvationDate ? new Date(member.salvationDate) : undefined,
        baptismDate: member.baptismDate ? new Date(member.baptismDate) : undefined,
        holyGhostBaptism: !!member.holyGhostBaptism,
        membershipStatus: member.membershipStatus || "Active",
        joinDate: member.joinDate ? new Date(member.joinDate) : undefined,
        invitedBy: member.invitedBy || "",
        role: member.role || "",
        volunteerGroups: member.volunteerGroups || [],
        isLeader: !!member.isLeader,
        familyId: member.familyId || "",
        household: {
          spouse: member.household?.spouse || "",
          children: (member.household?.children ?? []).map((child) => ({
            ...child,
            dob: child.dob ? new Date(child.dob) : undefined,
          })) || [],
          dependents: member.household?.dependents || [],
        },
        photoUrl: member.photoUrl || "",
        notes: member.notes || "",
      });
    }
  }, [member, reset]);

  useBeforeUnload((event) => {
    if (isDirty) {
      event.preventDefault();
      return "You have unsaved changes. Are you sure you want to leave?";
    }
  });

  const submitting = update.isPending || assignLeader.isPending;

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    try {
      // TODO: Handle photo upload if photoFile, set data.photoUrl = uploaded url
      await update.mutateAsync(data);
      toast.success("Member updated successfully!");
      nav(-1);
    } catch (err) {
      toast.error("Failed to save changes.");
    }
  };

  const toggleGroup = (gid: string) => {
    const current = watch("volunteerGroups") || [];
    const updated = current.includes(gid)
      ? current.filter((id) => id !== gid)
      : [...current, gid];
    setValue("volunteerGroups", updated);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setValue("photoUrl", URL.createObjectURL(file));
      // TODO: Upload to server and set actual URL
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6 lg:p-8 rounded-3xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
      >
      {/* Minimal sticky header (replaces both header + gradient banner) */}
<header
  className="sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800/60
             bg-gradient-to-br from-amber-200 to-yellow-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur h-24 supports-[backdrop-filter]:bg-white/60"
  role="region"
  aria-label="Member editor actions"
>
  <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 sm:py-3.5 grid grid-cols-3 items-center gap-3">
    {/* Back */}
    <button
      type="button"
      onClick={() => nav(-1)}
      className="justify-self-start inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5
                 bg-slate-100/70 hover:bg-slate-200/70
                 dark:bg-slate-800/60 dark:hover:bg-slate-700/60
                 text-slate-700 dark:text-slate-200
                 ring-1 ring-slate-200/70 dark:ring-slate-700
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">Back</span>
    </button>

    {/* Center: avatar + name + status */}
    <div className="justify-self-center min-w-0 flex items-center gap-3">
      <div className="relative">
        <img
          src={watch("photoUrl") || "https://placehold.co/40x40?text=PC"}
          alt=""
          className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
        />
        {/* tiny edit badge (optional) */}
        <label className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-800 rounded-full shadow cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700">
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          <Edit3 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" />
        </label>
      </div>

      <div className="min-w-0">
        <div className="truncate font-semibold text-slate-900 dark:text-slate-100">
          {member.firstName} {member.middleName} {member.lastName}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <BadgeCheck className="h-3.5 w-3.5" />
          <span className="truncate">{member.membershipStatus}</span>
        </div>
      </div>
    </div>

    {/* Save */}
    <button
      type="button"
      onClick={handleSubmit(onSubmit)}
      disabled={submitting}
      className="justify-self-end inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium
                 text-white shadow-sm disabled:opacity-70 disabled:cursor-not-allowed
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
      style={{
        background: submitting
          ? "linear-gradient(135deg,#6B7280,#9CA3AF)"
          : "linear-gradient(135deg,#8B0000,#D4AF37)",
      }}
      aria-live="polite"
      aria-busy={submitting}
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Saving…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" aria-hidden />
          Save
        </>
      )}
    </button>
  </div>
</header>


        {/* Tabs */}
        <Tabs defaultValue="personal" className="p-6 space-y-8 ">
          <TabsList className="flex flex-wrap gap-2 bg-transparent border-b-0">
            <TabsTrigger value="personal" className="rounded-full shadow-md hover:bg-slate-200">Personal</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-full shadow-md hover:bg-slate-200">Contact</TabsTrigger>
            <TabsTrigger value="spiritual" className="rounded-full shadow-md hover:bg-slate-200">Spiritual</TabsTrigger>
            <TabsTrigger value="family" className="rounded-full shadow-md hover:bg-slate-200">Family</TabsTrigger>
            <TabsTrigger value="volunteer" className="rounded-full shadow-md hover:bg-slate-200">Volunteer</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-full shadow-md hover:bg-slate-200">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FancyInput
                label="First Name"
                icon={<User className="w-4 h-4 text-slate-400" />}
                {...register("firstName")}
                placeholder="Enter first name"
                error={errors.firstName?.message}
              />
              <FancyInput
                label="Middle Name"
                icon={<User className="w-4 h-4 text-slate-400" />}
                {...register("middleName")}
                placeholder="Enter middle name"
                error={errors.middleName?.message}
              />
              <FancyInput
                label="Last Name"
                icon={<User className="w-4 h-4 text-slate-400" />}
                {...register("lastName")}
                placeholder="Enter last name"
                error={errors.lastName?.message}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FancySelect
                label="Gender"
                {...register("gender")}
                options={[
                  { label: "Select Gender", value: "" },
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]}
                icon={<User className="w-4 h-4 text-slate-400" />}
                error={errors.gender?.message}
              />
              <FancyDate
                label="Date of Birth"
                value={watch("dob")}
                onChange={(v) => setValue("dob", v)}
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
                error={errors.dob?.message}
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FancyInput
                label="Email Address"
                type="email"
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                {...register("email")}
                placeholder="user@example.com"
                error={errors.email?.message}
              />
              <FancyInput
                label="Primary Phone"
                type="tel"
                icon={<Phone className="w-4 h-4 text-slate-400" />}
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
                error={errors.phone?.message}
              />
              <FancyInput
                label="Alternate Phone"
                type="tel"
                icon={<Phone className="w-4 h-4 text-slate-400" />}
                {...register("altPhone")}
                placeholder="Alternate number"
                error={errors.altPhone?.message}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <FancyInput
                label="Street Address"
                icon={<MapPin className="w-4 h-4 text-slate-400" />}
                {...register("address.street")}
                placeholder="123 Main St"
                error={errors.address?.street?.message}
              />
              <FancyInput
                label="City"
                {...register("address.city")}
                placeholder="City"
                error={errors.address?.city?.message}
              />
              <FancyInput
                label="State/Province"
                {...register("address.state")}
                placeholder="State"
                error={errors.address?.state?.message}
              />
              <FancyInput
                label="Country"
                {...register("address.country")}
                placeholder="Country"
                error={errors.address?.country?.message}
              />
              <FancyInput
                label="ZIP/Postal Code"
                {...register("address.zip")}
                placeholder="12345"
                error={errors.address?.zip?.message}
              />
            </div>
          </TabsContent>

          <TabsContent value="spiritual" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FancySelect
                label="Membership Status"
                {...register("membershipStatus")}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Visitor", value: "Visitor" },
                  { label: "New Convert", value: "New Convert" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                icon={<BadgeCheck className="w-4 h-4 text-slate-400" />}
                error={errors.membershipStatus?.message}
              />
              <FancyDate
                label="Join Date"
                value={watch("joinDate")}
                onChange={(v) => setValue("joinDate", v)}
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
                error={errors.joinDate?.message}
              />
              <FancyInput
                label="Role/Position"
                {...register("role")}
                placeholder="e.g., Elder, Deacon"
                icon={<Crown className="w-4 h-4 text-slate-400" />}
                error={errors.role?.message}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FancyDate
                label="Salvation Date"
                value={watch("salvationDate")}
                onChange={(v) => setValue("salvationDate", v)}
                icon={<Heart className="w-4 h-4 text-slate-400" />}
                error={errors.salvationDate?.message}
              />
              <FancyDate
                label="Baptism Date"
                value={watch("baptismDate")}
                onChange={(v) => setValue("baptismDate", v)}
                icon={<Zap className="w-4 h-4 text-slate-400" />}
                error={errors.baptismDate?.message}
              />
              <FancyCheckbox
                label="Holy Ghost Baptism"
                checked={watch("holyGhostBaptism") || false}
                onChange={(v) => setValue("holyGhostBaptism", v)}
                icon={<Zap className="w-4 h-4 text-purple-400" />}
              />
            </div>
            <FancyInput
              label="Invited By"
              {...register("invitedBy")}
              placeholder="Name of inviter"
              icon={<Users className="w-4 h-4 text-slate-400" />}
              error={errors.invitedBy?.message}
            />
          </TabsContent>

          <TabsContent value="family" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FancySelect
                label="Marital Status"
                {...register("maritalStatus")}
                options={[
                  { label: "Select Status", value: "" },
                  { label: "Single", value: "Single" },
                  { label: "Married", value: "Married" },
                  { label: "Divorced", value: "Divorced" },
                  { label: "Widowed", value: "Widowed" },
                ]}
                icon={<Users className="w-4 h-4 text-slate-400" />}
                error={errors.maritalStatus?.message}
              />
              <FancyInput
                label="Spouse Name"
                {...register("household.spouse")}
                placeholder="Full name of spouse"
                icon={<Users className="w-4 h-4 text-slate-400" />}
                error={errors.household?.spouse?.message}
              />
              <FancyDate
                label="Wedding Anniversary"
                value={watch("weddingAnniversary")}
                onChange={(v) => setValue("weddingAnniversary", v)}
                icon={<Heart className="w-4 h-4 text-slate-400" />}
                error={errors.weddingAnniversary?.message}
              />
              <FancyInput
                label="Family ID"
                {...register("familyId")}
                placeholder="Family group ID"
                icon={<Users className="w-4 h-4 text-slate-400" />}
                error={errors.familyId?.message}
              />
            </div>

            {/* Children */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Children</h3>
                <motion.button
                  type="button"
                  onClick={() => append({ name: "", dob: undefined })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white text-sm shadow-sm hover:shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Child
                </motion.button>
              </div>
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <FancyInput
                      label={`Child Name`}
                      {...register(`household.children.${index}.name` as const)}
                      placeholder="Child's name"
                      error={errors.household?.children?.[index]?.name?.message}
                    />
                    <FancyDate
                      label="DOB"
                      value={watch(`household.children.${index}.dob` as const)}
                      onChange={(v) => setValue(`household.children.${index}.dob` as const, v)}
                      icon={<Calendar className="w-4 h-4 text-slate-400" />}
                      error={errors.household?.children?.[index]?.dob?.message}
                    />
                    <motion.button
                      type="button"
                      onClick={() => remove(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="col-span-1 md:col-span-3 mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {fields.length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-4">No children added.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="volunteer" className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = (watch("volunteerGroups") || []).includes(g._id);
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
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">Toggle groups to add/remove. Assign leadership above.</p>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <FancyTextarea
              {...register("notes")}
              placeholder="Enter any additional notes or comments..."
              icon={<Edit3 className="w-4 h-4 text-slate-400 absolute left-3 top-3 opacity-50" />}
              error={errors.notes?.message}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
