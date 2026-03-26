// hooks/useTheme.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { themeService } from "@/services/theme.service";
import { useEffect, useState } from "react";
import { Theme } from "@/types/theme";

const THEME_STORAGE_KEY = "app_theme";
const THEME_VERSION_KEY = "app_theme_version";

export const useTheme = () => {
  const queryClient = useQueryClient();

  // Load theme dari localStorage sebagai initial state
  const [cachedTheme, setCachedTheme] = useState<Theme | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const {
    data: themesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["theme"],
    queryFn: async () => {
      // Fetch semua themes (gunakan limit besar untuk mendapatkan semua)
      const response = await themeService.getThemes({ page: 1, limit: 100 });
      return response;
    },
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
    gcTime: 1000 * 60 * 60, // Garbage collection setelah 1 jam
    refetchOnWindowFocus: true, // Refetch saat window focus untuk deteksi perubahan
    refetchOnMount: true, // Selalu refetch saat mount untuk update terbaru
  });

  // Extract themes array dari response
  const themes = themesResponse?.data || [];

  // Ambil theme default atau theme pertama dari array
  const theme = themes.find((t) => t.is_default) || themes[0];

  // Simpan theme ke localStorage ketika berhasil di-fetch dengan versioning
  useEffect(() => {
    if (theme) {
      const themeString = JSON.stringify(theme);
      const newVersion = Date.now().toString();

      // Cek apakah theme berubah
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme !== themeString) {
        localStorage.setItem(THEME_STORAGE_KEY, themeString);
        localStorage.setItem(THEME_VERSION_KEY, newVersion);
        setCachedTheme(theme);
      }
    }
  }, [theme]);

  // Gunakan cached theme jika theme dari API belum ready
  const activeTheme = theme || cachedTheme;

  // Default colors jika theme belum ter-load
  const primaryColor = activeTheme?.primary_color || "#0F172A";
  const secondaryColor = activeTheme?.secondary_color || "#F8FAFC";
  const buttonPrimaryColor = activeTheme?.button_primary_color || "#2563EB";
  const buttonSecondaryColor = activeTheme?.button_secondary_color || "#E2E8F0";
  const primaryTextColor = activeTheme?.primary_text_color || "#FFFFFF";
  const secondaryTextColor = activeTheme?.secondary_text_color || "#94A3B8";
  const primaryTableColor = activeTheme?.primary_table_color || "#1E293B";
  const secondaryTableColor = activeTheme?.secondary_table_color || "#0B1120";
  const primaryCardColor = activeTheme?.primary_card_color || "#172033";
  const secondaryCardColor = activeTheme?.secondary_card_color || "#0F1624";
  const sidebarForeground = activeTheme?.sidebar_foreground || "#CBD2EE";
  const sidebarPrimary = activeTheme?.sidebar_primary || "#0B1120";
  const sidebarPrimaryForeground =
    activeTheme?.sidebar_primary_foreground || "#FFFFFF";
  const sidebarHeaderPrimary = activeTheme?.sidebar_header_primary || "#1E293B";
  const sidebarHeaderForeground =
    activeTheme?.sidebar_header_foreground || "#FFFFFF";
  const headerPrimary = activeTheme?.header_primary || "#FFFFFF";
  const headerForeground = activeTheme?.header_foreground || "#0F172A";

  // Function untuk force refresh theme
  const refreshTheme = () => {
    // Clear localStorage cache
    if (typeof window !== "undefined") {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(THEME_VERSION_KEY);
    }
    // Invalidate query untuk trigger refetch
    queryClient.invalidateQueries({ queryKey: ["theme"] });
  };

  // Function untuk clear theme cache secara manual
  const clearThemeCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(THEME_VERSION_KEY);
    }
    setCachedTheme(null);
  };

  return {
    theme: activeTheme,
    themes,
    themesMetadata: themesResponse?.metadata,
    primaryColor,
    secondaryColor,
    buttonPrimaryColor,
    buttonSecondaryColor,
    primaryTextColor,
    secondaryTextColor,
    primaryTableColor,
    secondaryTableColor,
    primaryCardColor,
    secondaryCardColor,
    sidebarForeground,
    sidebarPrimary,
    sidebarPrimaryForeground,
    sidebarHeaderPrimary,
    sidebarHeaderForeground,
    headerPrimary,
    headerForeground,
    isLoading,
    error,
    refreshTheme, // Export function untuk manual refresh
    clearThemeCache, // Export function untuk clear cache
  };
};
