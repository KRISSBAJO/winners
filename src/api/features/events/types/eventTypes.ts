export type EventType = "Service" | "BibleStudy" | "Conference" | "Outreach" | "Meeting";
export type Visibility = "public" | "private" | "unlisted";

export type EventComment = {
  _id: string;
  author: string;       // user id
  authorName?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type Event = {
  _id: string;
  churchId: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location?: string;
  visibility: Visibility;
  tags: string[];
  coverImageUrl?: string;
  cover?: { url: string; publicId: string }; // if populated from backend

  likes: string[];
  likeCount: number;
  comments: EventComment[];
  commentCount: number;

  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;

  createdAt: string;
  updatedAt: string;
};

export type EventListResponse = {
  items: Event[];
  total: number;
  page: number;
  pages: number;
};

export type CreateEventInput = {
  churchId: string;
  title: string;
  type: EventType;
  startDate: string;
  description?: string;
  endDate?: string;
  location?: string;
  visibility?: Visibility;
  tags?: string[];      // will be sent as comma-separated in formData
  cover?: File | null;  // multipart field "cover"
};

export type UpdateEventInput = Partial<CreateEventInput>;
