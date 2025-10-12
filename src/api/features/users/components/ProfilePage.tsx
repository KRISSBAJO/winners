import { useState } from "react";
import { motion } from "framer-motion";
import { useProfile } from "../hooks/useProfile";
import { Camera, Save } from "lucide-react";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function ProfilePage() {
  const { user, updateProfile, isUpdating } = useProfile();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);

  /** handle input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /** handle form submission */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ ...form, avatar });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        My Profile
      </h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-slate-900/70 p-6 rounded-xl shadow-md space-y-5"
      >
        {/* Avatar upload */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <img
              src={
                avatar
                  ? URL.createObjectURL(avatar)
                  : user?.avatar || "/avatar-placeholder.png"
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-[#D4AF37]"
            />
            <label
              htmlFor="avatar"
              className="absolute bottom-1 right-1 bg-[#8B0000] p-2 rounded-full text-white cursor-pointer hover:bg-[#D4AF37] transition"
            >
              <Camera size={16} />
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <p className="text-lg font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 capitalize">
              Role: {user?.role}
            </p>
          </div>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["firstName", "middleName", "lastName", "phone"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field}
              </label>
              <input
                name={field}
                value={(form as any)[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isUpdating}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold shadow-md transition disabled:opacity-70"
          style={{
            background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
          }}
        >
          <Save size={18} />
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </motion.form>
    </div>
  );
}
