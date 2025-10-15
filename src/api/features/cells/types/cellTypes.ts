// src/api/features/cells/types/cellTypes.ts
export type Id = string;

export interface CellGroup {
  _id: Id;
  churchId: Id;
  nationalChurchId?: Id; // ← optional, helps UI scope chips
  districtId?: Id;       // ← optional, helps UI scope chips
  name: string;
  title?: string;
  description?: string;
  leaderId?: Id;
  assistantId?: Id;
  secretaryId?: Id;
  members: Id[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CellMeeting {
  _id: Id;
  churchId: Id;
  cellId: Id;
  title?: string;
  scheduledFor: string;
  status: "scheduled"|"held"|"cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CellAttendanceReport {
  _id: Id;
  churchId: Id;
  cellId: Id;
  meetingId?: Id;
  date: string;
  totals: { men: number; women: number; children: number; firstTimers: number; newConverts: number };
  presentMemberIds: Id[];
  submittedBy: Id;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCellInput = Omit<CellGroup, "_id"|"createdAt"|"updatedAt"|"members"|"isActive"> & {
  members?: Id[];
  isActive?: boolean;
};
export type UpdateCellInput = Partial<CreateCellInput>;

export type CreateMeetingInput = Omit<CellMeeting, "_id"|"status"|"createdAt"|"updatedAt"> & {
  status?: CellMeeting["status"];
};
export type UpdateMeetingInput = Partial<CreateMeetingInput>;

export type SubmitReportInput = Omit<CellAttendanceReport, "_id"|"createdAt"|"updatedAt"|"submittedBy">;

// 🔽 query types used by hooks/services
export type MeetingsQuery = {
  cellId?: Id;
  churchId?: Id;
  districtId?: Id;
  nationalChurchId?: Id;
  nationalId?: Id; // UI may send this; service will map → nationalChurchId
  from?: string;
  to?: string;
};

export type ReportsQuery = {
  cellId?: Id;
  churchId?: Id;
  districtId?: Id;
  nationalChurchId?: Id;
  nationalId?: Id; // UI may send this; service will map → nationalChurchId
  from?: string;
  to?: string;
};

export type AnalyticsQuery = {
  churchId?: Id;
  districtId?: Id;
  nationalChurchId?: Id;
  from?: string;
  to?: string;
};
