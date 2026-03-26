// types/user.ts

import { Role } from './auth';
import { Company, Branch } from './company';

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role_id: string;
  role_name: string;
  is_verified: boolean;
  is_internal: boolean;
  is_2fa: boolean;
  ip_whitelist?: string; // JSON string of IP addresses
  created_at: string;
  updated_at: string;
  platform_id?: string;
  platform_name?: string;
  agent_id?: string;
  agent_name?: string;
  partner_id?: string;
  partner_name?: string;
}

export interface ExternalUser {
  id: string;
  name: string;
  role_id: string;
  role: Role;
  company_id?: string;
  company?: Company;
  branch_id?: string;
  branch?: Branch;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  email?: string;
  phone?: string;
  search?: string;
  role?: string;
  role_id?: string;
  platform_id?: string;
  agent_id?: string;
  is_verified?: boolean;
  is_internal?: boolean;
  deleted?: boolean;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: User[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  roles?: {
    [key: string]: number;
  };
}

export interface UserDetailResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: string;
  is_internal?: boolean;
  partner_id?: string;
  platform_id?: string;
  agent_id?: string;
  ip_whitelist?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  ip_whitelist?: string;
}

export interface ExternalUserResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: ExternalUser[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}