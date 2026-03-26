// services/theme.service.ts

import { apiClient } from "@/lib/axios";
import {
  Theme,
  ThemeResponse,
  ThemeDetailResponse,
  ThemeQueryParams,
  CreateThemeRequest,
  UpdateThemeRequest,
} from "@/types/theme";

class ThemeService {
  /**
   * Get all themes with optional filters
   * Returns full response including metadata for pagination
   */
  async getThemes(params?: ThemeQueryParams): Promise<ThemeResponse> {
    const { data } = await apiClient.get<ThemeResponse>(
      "/api/v1/internal/themes",
      { params }
    );

    if (data.success) {
      return data; // Return full response including metadata
    }

    throw new Error(data.message || "Failed to fetch themes");
  }

  /**
   * Get theme by ID
   */
  async getThemeById(themeId: string): Promise<Theme> {
    const { data } = await apiClient.get<ThemeDetailResponse>(
      `/api/v1/internal/themes/${themeId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch theme details");
  }

  /**
   * Create new theme
   */
  async createTheme(payload: CreateThemeRequest): Promise<Theme> {
    const { data } = await apiClient.post<ThemeDetailResponse>(
      "/api/v1/internal/themes",
      payload
    );

    if (data.success && data.data) {
      // Clear localStorage cache ketika theme baru dibuat
      if (typeof window !== "undefined") {
        localStorage.removeItem("app_theme");
        localStorage.removeItem("app_theme_version");
      }
      return data.data;
    }

    throw new Error(data.message || "Failed to create theme");
  }

  /**
   * Update existing theme
   */
  async updateTheme(
    themeId: string,
    payload: UpdateThemeRequest
  ): Promise<Theme> {
    const { data } = await apiClient.put<ThemeDetailResponse>(
      `/api/v1/internal/themes/${themeId}`,
      payload
    );

    if (data.success && data.data) {
      // Clear localStorage cache ketika theme di-update
      if (typeof window !== "undefined") {
        localStorage.removeItem("app_theme");
        localStorage.removeItem("app_theme_version");
      }
      return data.data;
    }

    throw new Error(data.message || "Failed to update theme");
  }

  /**
   * Delete theme
   */
  async deleteTheme(themeId: string): Promise<void> {
    const { data } = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/api/v1/internal/themes/${themeId}`);

    if (!data.success) {
      throw new Error(data.message || "Failed to delete theme");
    }

    // Clear localStorage cache ketika theme dihapus
    if (typeof window !== "undefined") {
      localStorage.removeItem("app_theme");
      localStorage.removeItem("app_theme_version");
    }
  }
}

export const themeService = new ThemeService();
