// services/announcement.service.ts
import { apiClient } from "@/lib/axios";
import {
  Announcement,
  AnnouncementResponse,
  AnnouncementDetailResponse,
  AnnouncementQueryParams,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  DeleteAnnouncementResponse,
} from "@/types/announcement";

class AnnouncementService {
  /**
   * Get all announcements with optional filters
   * Returns full response with data and metadata
   */
  async getAnnouncements(
    params?: AnnouncementQueryParams
  ): Promise<AnnouncementResponse> {
    const { data } = await apiClient.get<AnnouncementResponse>(
      "/api/v1/internal/announcements",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch announcements");
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(announcementId: string): Promise<Announcement> {
    const { data } = await apiClient.get<AnnouncementDetailResponse>(
      `/api/v1/internal/announcements/${announcementId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch announcement");
  }

  /**
   * Create new announcement
   */
  async createAnnouncement(
    payload: CreateAnnouncementPayload
  ): Promise<Announcement> {
    const { data } = await apiClient.post<AnnouncementDetailResponse>(
      "/api/v1/internal/announcements",
      payload
    );

    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data[0] : data.data;
    }

    throw new Error(data.message || "Failed to create announcement");
  }

  /**
   * Update existing announcement
   */
  async updateAnnouncement(
    announcementId: string,
    payload: UpdateAnnouncementPayload
  ): Promise<Announcement> {
    const { data } = await apiClient.put<AnnouncementDetailResponse>(
      `/api/v1/internal/announcements/${announcementId}`,
      payload
    );

    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data[0] : data.data;
    }

    throw new Error(data.message || "Failed to update announcement");
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(announcementId: string): Promise<void> {
    const { data } = await apiClient.delete<DeleteAnnouncementResponse>(
      `/api/v1/internal/announcements/${announcementId}`
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to delete announcement");
    }
  }

  /**
   * Update announcement status
   */
  async updateAnnouncementStatus(
    announcementId: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<Announcement> {
    const { data } = await apiClient.patch<AnnouncementDetailResponse>(
      `/api/v1/internal/announcements/${announcementId}/status`,
      { status }
    );

    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data[0] : data.data;
    }

    throw new Error(data.message || "Failed to update announcement status");
  }
}

export const announcementService = new AnnouncementService();