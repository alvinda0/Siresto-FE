// types/theme.ts

export interface Theme {
  theme_id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  button_primary_color: string;
  button_secondary_color: string;
  primary_text_color: string;
  secondary_text_color: string;
  primary_table_color: string;
  secondary_table_color: string;
  primary_card_color: string;
  secondary_card_color: string;
  sidebar_foreground: string;
  sidebar_primary: string;
  sidebar_primary_foreground: string;
  sidebar_header_primary: string;
  sidebar_header_foreground: string;
  header_primary: string;
  header_foreground: string;
  is_default: boolean;
  updated_at: string;
  created_at: string;
}

export interface ThemeQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: string;
}

export interface ThemeResponse {
  success: boolean;
  message: string;
  data: Theme[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ThemeDetailResponse {
  success: boolean;
  message: string;
  data: Theme;
}

export interface CreateThemeRequest {
  name: string;
  primary_color: string;
  secondary_color: string;
  button_primary_color: string;
  button_secondary_color: string;
  primary_text_color: string;
  secondary_text_color: string;
  primary_table_color: string;
  secondary_table_color: string;
  primary_card_color: string;
  secondary_card_color: string;
  sidebar_foreground: string;
  sidebar_primary: string;
  sidebar_primary_foreground: string;
  sidebar_header_primary: string;
  sidebar_header_foreground: string;
  header_primary: string;
  header_foreground: string;
  is_default: boolean;
}

export interface UpdateThemeRequest {
  name?: string;
  primary_color?: string;
  secondary_color?: string;
  button_primary_color?: string;
  button_secondary_color?: string;
  primary_text_color?: string;
  secondary_text_color?: string;
  primary_table_color?: string;
  secondary_table_color?: string;
  primary_card_color?: string;
  secondary_card_color?: string;
  sidebar_foreground?: string;
  sidebar_primary?: string;
  sidebar_primary_foreground?: string;
  sidebar_header_primary?: string;
  sidebar_header_foreground?: string;
  header_primary?: string;
  header_foreground?: string;
  is_default?: boolean;
}