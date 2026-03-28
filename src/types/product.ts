// types/product.ts

export interface Product {
  id: string;
  company_id: string;
  branch_id: string;
  category_id: string;
  image: string;
  name: string;
  description: string;
  stock: number;
  price: number;
  position: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface CreateProductPayload {
  branch_id: string;
  category_id: string;
  image: File;
  name: string;
  description: string;
  stock: number;
  price: number;
  position: string;
  is_available: boolean;
}

export interface UpdateProductPayload {
  category_id?: string;
  image?: File;
  name?: string;
  description?: string;
  stock?: number;
  price?: number;
  position?: string;
  is_available?: boolean;
}
