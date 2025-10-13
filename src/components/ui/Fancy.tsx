
import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Calendar, CheckCircle2, ChevronDown } from "lucide-react";
/* ------- Enhanced UI Components ------- */

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


export function FancyInput({
  label,
  placeholder,
  type = "text",
  icon,
  error,
  ...props
}: {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <motion.div
        className="relative"
        variants={inputVariants}
        whileFocus="focus"
        whileHover="hover"
      >
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
            error ? "border-red-500 focus:ring-red-200" : "border-slate-200/50 dark:border-slate-700/50 focus:border-[#8B0000] focus:ring-[#8B0000]/20"
          } bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200`}
          placeholder={placeholder}
          {...props}
        />
      </motion.div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">
          {error}
        </motion.p>
      )}
    </label>
  );
}

export function FancySelect({
  label,
  options,
  icon,
  error,
  ...props
}: {
  label: string;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <motion.div
        className="relative"
        variants={inputVariants}
        whileFocus="focus"
        whileHover="hover"
      >
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
            error ? "border-red-500 focus:ring-red-200" : "border-slate-200/50 dark:border-slate-700/50 focus:border-[#8B0000] focus:ring-[#8B0000]/20"
          } bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200 appearance-none`}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          ▼
        </div>
      </motion.div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">
          {error}
        </motion.p>
      )}
    </label>
  );
}

export function FancyDate({
  label,
  value,
  onChange,
  icon,
  error,
}: {
  label: string;
  value?: Date;
  onChange: (v?: Date) => void;
  icon?: React.ReactNode;
  error?: string;
}) {
  const str = useMemo(() => (value ? new Date(value).toISOString().slice(0, 10) : ""), [value]);
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <motion.div
        className="relative"
        variants={inputVariants}
        whileFocus="focus"
        whileHover="hover"
      >
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type="date"
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
            error ? "border-red-500 focus:ring-red-200" : "border-slate-200/50 dark:border-slate-700/50 focus:border-[#8B0000] focus:ring-[#8B0000]/20"
          } bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200`}
          value={str}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
        />
      </motion.div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">
          {error}
        </motion.p>
      )}
    </label>
  );
}

export function FancyCheckbox({
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

export function FancyTextarea({
  placeholder,
  icon,
  error,
  ...props
}: {
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-1 w-full">
      <motion.div
        className="relative"
        variants={inputVariants}
        whileFocus="focus"
        whileHover="hover"
      >
        {icon && (
          <div className="absolute left-3 top-3 pointer-events-none">
            {icon}
          </div>
        )}
        <textarea
          rows={6}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
            error ? "border-red-500 focus:ring-red-200" : "border-slate-200/50 dark:border-slate-700/50 focus:border-[#8B0000] focus:ring-[#8B0000]/20"
          } bg-white/50 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700/50 transition-all duration-200 resize-none`}
          {...props}
        />
      </motion.div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">
          {error}
        </motion.p>
      )}
    </label>
  );
}
