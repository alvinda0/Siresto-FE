// types/announcement.ts
export interface Announcement {
  announcement_id: string;
  title: string;
  content: string;
  status: "ACTIVE" | "INACTIVE";
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface AnnouncementResponse {
  success: boolean;
  message: string;
  data: Announcement[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AnnouncementDetailResponse {
  success: boolean;
  message: string;
  data: Announcement;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface DeleteAnnouncementResponse {
  success: boolean;
  message: string;
}