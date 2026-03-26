// services/company.service.ts

import { apiClient } from '@/lib/axios';
import { Company, CompanyResponse, Branch, BranchResponse } from '@/types/company';

class CompanyService {
  /**
   * Get my companies (for external users)
   */
  async getMyCompanies(): Promise<Company[]> {
    const { data } = await apiClient.get<CompanyResponse>(
      '/api/v1/external/companies/my'
    );
    return data.data;
  }

  /**
   * Get branches by company ID
   */
  async getBranchesByCompanyId(companyId: string): Promise<BranchResponse> {
    const { data } = await apiClient.get<BranchResponse>(
      `/api/v1/external/branches/company/${companyId}`
    );
    return data;
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<{ data: Array<{
    id: string;
    name: string;
    display_name: string;
    type: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }> }> {
    const { data } = await apiClient.get('/api/v1/roles');
    return data;
  }

  /**
   * Create a new branch
   */
  async createBranch(branchData: {
    company_id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
  }): Promise<{ data: Branch }> {
    const { data } = await apiClient.post<{ data: Branch }>(
      '/api/v1/external/branches',
      branchData
    );
    return data;
  }
}

export const companyService = new CompanyService();
