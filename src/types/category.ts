// types/category.ts

export interface Category {
  id: string;
  company_id: string;
  branch_id: string;
  name: string;
  description: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface CreateCategoryRequest {
  company_id: string;
  branch_id: string;
  name: string;
  description: string;
  position?: number;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  position?: number;
  is_active?: boolean;
}
