
export type Gender = "Male" | "Female" | "Other";

export type MembershipStatus = "Active" | "Visitor" | "New Convert" | "Inactive";

export type MemberAddress = {
  street?: string; city?: string; state?: string; country?: string; zip?: string;
};

export type HouseholdChild = { name: string; dob?: string | Date };

export type Member = {
  _id: string;
  churchId: string | { _id: string; name: string; districtId: string };
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: "Male" | "Female" | "Other";
  dob?: string | Date;
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  spouseName?: string;
  weddingAnniversary?: string | Date;
  email?: string;
  phone?: string;
  altPhone?: string;
  address?: MemberAddress;
  salvationDate?: string | Date;
  baptismDate?: string | Date;
  holyGhostBaptism?: boolean;
  membershipStatus: MembershipStatus;
  joinDate?: string | Date;
  invitedBy?: string;
  role?: string;
  volunteerGroups?: string[];
  isLeader?: boolean;
  familyId?: string;
  household?: {
    spouse?: string;
    children?: HouseholdChild[];
    dependents?: string[];
  };
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMemberInput = Partial<Member> & {
  firstName: string;
  lastName: string;
  churchId: string;
  membershipStatus?: MembershipStatus;
};

export type UpdateMemberInput = Partial<Member>;


export interface MemberStats {
  total: number;
  active: number;
  visitors: number;
  converts: number;
}

export interface UploadMembersResult {
  successCount: number;
  failedCount: number;
  errors: Array<{ row: any; error: string }>;
}
