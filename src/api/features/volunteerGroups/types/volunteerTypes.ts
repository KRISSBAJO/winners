export type VolunteerGroup = {
  _id: string;
  churchId: string;
  name: string;
  description?: string;
  leaderId?: string;         // Member _id
  members: string[];         // Member _ids
  createdAt?: string;
  updatedAt?: string;
};

export type CreateGroupInput = {
  churchId: string;
  name: string;
  description?: string;
};

export type UpdateGroupInput = Partial<CreateGroupInput> & {
  leaderId?: string | null;
  members?: string[];
};
