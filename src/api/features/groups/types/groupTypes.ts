// src/api/types/group.ts
export type ObjectId = string;

export type GroupType =
  | "cell" | "ministry" | "class" | "prayer" | "outreach"
  | "youth" | "women" | "men" | "seniors" | "other";

export type GroupVisibility = "public" | "members" | "private";
export type JoinPolicy = "request" | "invite" | "auto";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface Group {
  _id: ObjectId;
  churchId: ObjectId;
  nationalChurchId?: ObjectId;
  districtId?: ObjectId;
  type: GroupType;
  name: string;
  subtitle?: string;
  description?: string;
  coverUrl?: string;
  tags?: string[];
  publicArea?: string;
  visibility?: GroupVisibility;
  joinPolicy?: JoinPolicy;
  address?: string; // private
  geo?: GeoPoint;
  meetDay?: string;   //    meetDay:   Date,
  meetTime?: string;
  leaders?: ObjectId[];
  members?: ObjectId[];
  capacity?: number;
  isActive?: boolean;
  createdBy?: ObjectId;
  createdAt?: string;
  updatedAt?: string;
}

export type GroupCreate = Omit<Group, "_id" | "createdAt" | "updatedAt" | "createdBy"> & {
  churchId: ObjectId;
  type: GroupType;
  name: string;
  meetDay: string;
  meetTime: string;
};


// src/api/features/groups/types/groupTypes.ts
export type NextOccurrenceSummary = {
  groupId: ObjectId;
  startAt: string;          // ISO
  rrule?: string;           // optional, if recurring
  locationOverride?: string;
};
 
export type GroupUpdate = Partial<GroupCreate>;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

/** Public projection (no private address/geo/leaders/members) */
export interface GroupPublic {
  _id: ObjectId;
  type: GroupType;
  name: string;
  subtitle?: string;
  description?: string;
  coverUrl?: string;
  tags?: string[];
  publicArea?: string;
  visibility?: GroupVisibility;
  joinPolicy?: JoinPolicy;
  capacity?: number;
}

export interface Occurrence {
  _id: ObjectId;
  churchId: ObjectId;
  groupId: ObjectId;
  title?: string;
  startAt: string;
  endAt?: string;
  notes?: string;
  status?: "scheduled" | "held" | "cancelled";
  rrule?: string;
  locationOverride?: string;
  createdBy?: ObjectId;
  createdAt?: string;
  updatedAt?: string;
}

export type OccurrenceCreate = Omit<Occurrence, "_id" | "createdAt" | "updatedAt" | "churchId" | "groupId" | "createdBy"> & {
  startAt: string;
};

export type OccurrenceUpdate = Partial<OccurrenceCreate>;

export interface JoinRequest {
  _id: ObjectId;
  churchId: ObjectId;
  groupId: ObjectId;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  handledBy?: ObjectId;
  handledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type JoinRequestCreate = {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
};

/** Common query params */
export type ListParams = {
  q?: string;
  tag?: string;
  type?: GroupType;
  page?: number;
  limit?: number;
  sort?: "recent" | "name";
  isActive?: boolean;
};
