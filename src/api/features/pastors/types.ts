// src/api/features/pastors/types.ts

/* ---------- enums ---------- */

export const PastorTitles = [
  "Resident Pastor",
  "Assistant Resident Pastor",
  "Associate Pastor",
  "Youth Pastor",
  "Pastor",
] as const;
export type PastorTitle = typeof PastorTitles[number];

export const PastorLevels = ["national", "district", "church"] as const;
export type PastorLevel = typeof PastorLevels[number];

/* ---------- core models ---------- */

export interface Pastor {
  _id: string;
  userId?: string | null;

  firstName: string;
  middleName?: string | null;
  lastName: string;

  gender?: "Male" | "Female" | "Other" | null;
  phone?: string | null;
  email?: string | null;

  dateOfBirth?: string | null;       // ISO date (YYYY-MM-DD)
  dateBornAgain?: string | null;     // ISO date
  dateBecamePastor?: string | null;  // ISO date
  notes?: string | null;

  currentTitle: PastorTitle;
  level: PastorLevel;

  nationalChurchId?: string | null;
  districtId?: string | null;
  churchId?: string | null;

  isActive: boolean;
  isDeleted: boolean;

  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface PastorCreateInput {
  userId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: "Male" | "Female" | "Other";
  phone?: string;
  email?: string;
  dateOfBirth?: string;       // YYYY-MM-DD
  dateBornAgain?: string;     // YYYY-MM-DD
  dateBecamePastor?: string;  // YYYY-MM-DD
  notes?: string;
  currentTitle?: PastorTitle;
  level: PastorLevel;
  nationalChurchId?: string;
  districtId?: string;
  churchId?: string;
}

export interface PastorUpdateInput {
  userId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: "Male" | "Female" | "Other";
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  dateBornAgain?: string;
  dateBecamePastor?: string;
  notes?: string;
  currentTitle?: PastorTitle;
  isActive?: boolean;
}

/* ---------- assignments ---------- */

export interface PastorAssignment {
  _id: string;
  pastorId: string;

  level: PastorLevel;
  nationalChurchId?: string | null;
  districtId?: string | null;
  churchId?: string | null;

  title: PastorTitle;

  startDate: string;       // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD

  reason?: string | null;
  createdBy?: string | null;
  endedBy?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface PastorAssignInput {
  level: PastorLevel;
  nationalChurchId?: string;
  districtId?: string;
  churchId?: string;
  title: PastorTitle;
  startDate: string; // YYYY-MM-DD
  reason?: string;
  endDate?: string;
}

export interface EndAssignmentInput {
  endDate?: string; // YYYY-MM-DD (defaults to today on API if omitted)
  reason?: string;
}

/* ---------- list params & pagination ---------- */

export interface PastorListParams {
  q?: string;
  title?: PastorTitle | string;
  level?: PastorLevel;
  nationalChurchId?: string;
  districtId?: string;
  churchId?: string;
  page?: number;  // default 1
  limit?: number; // default 50
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
