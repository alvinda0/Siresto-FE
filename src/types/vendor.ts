// types/vendor.ts

export interface Vendor {
  vendor_id: string;
  name: string;
  endpoint_url: string;
  sandbox_endpoint_url: string;
  created_at: string;
  updated_at: string;
}

export interface VendorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data: Vendor[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface VendorDetailResponse {
  success: boolean;
  message: string;
  data: Vendor;
}

export interface CreateVendorPayload {
  name: string;
  endpoint_url: string;
  sandbox_endpoint_url: string;
}

export interface UpdateVendorPayload {
  name?: string;
  endpoint_url?: string;
  sandbox_endpoint_url?: string;
}