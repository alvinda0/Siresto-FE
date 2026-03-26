// types/company.ts

export interface Role {
  id: string;
  name: string;
  display_name: string;
  type: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: string;
  name: string;
  role_id: string;
  role: Role;
  company_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  company_id: string;
  company?: Company;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  owner_id: string;
  owner: Owner;
  branches?: Branch[];
  created_at: string;
  updated_at: string;
}

export interface CompanyResponse {
  data: Company[];
}

export interface BranchResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: Branch[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}
