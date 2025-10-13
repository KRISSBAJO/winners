// src/api/features/followup/types/followupTypes.ts
export type FollowUpType = "newcomer" | "absentee" | "evangelism" | "care";
export type FollowUpStatus = "open" | "in_progress" | "paused" | "resolved" | "archived";
export type AttemptChannel = "email" | "sms" | "call" | "in_person" | "other";
export type AttemptOutcome = "sent" | "connected" | "left_voicemail" | "no_answer" | "not_interested" | "prayed" | "other";

export type IdRef = { _id: string; firstName?: string; lastName?: string; email?: string; phone?: string };

export interface ContactAttempt {
  _id: string;
  caseId: string;
  byUserId: string | IdRef;
  channel: AttemptChannel;
  outcome: AttemptOutcome;
  content?: string;
  nextActionOn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpCase {
  _id: string;
  memberId?: string | IdRef;
  prospect?: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    source?: string;
  };
  churchId: string;
  type: FollowUpType;
  status: FollowUpStatus;
  reason?: string;
  tags: string[];
  consent?: { email?: boolean; sms?: boolean; call?: boolean; updatedAt?: string };
  assignedTo?: string | IdRef;
  cadenceId?: string;
  currentStepIndex?: number;
  engagementScore: number;
  openedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface CadenceStep {
  name: string;
  channel: AttemptChannel;
  daysFromPrev?: number;
  templateKey?: string;
}
export interface FollowUpCadence {
  _id: string;
  churchId?: string | null;
  name: string;
  type: FollowUpType | "generic";
  steps: CadenceStep[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  _id: string;
  churchId?: string | null;
  key: string;
  subject?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}
