// src/utils/dateInput.ts
export function toDateInputValue(
  v?: string | Date | null
): string {
  if (!v) return "";
  const d = typeof v === "string" ? new Date(v) : v;
  if (!d || isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
