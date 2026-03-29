// types/tax.ts

export interface Tax {
  id: string;
  company_id: string;
  company_name: string;
  branch_id: string | null;
  branch_name: string | null;
  nama_pajak: string;
  tipe_pajak: string;
  presentase: number;
  deskripsi: string;
  status: string;
  prioritas: number;
  created_at: string;
  updated_at: string;
}

export interface TaxResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: Tax[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateTaxRequest {
  company_id: string;
  branch_id?: string;
  nama_pajak: string;
  tipe_pajak: string;
  presentase: number;
  deskripsi: string;
  status?: string;
  prioritas?: number;
}

export interface UpdateTaxRequest {
  nama_pajak?: string;
  tipe_pajak?: string;
  presentase?: number;
  deskripsi?: string;
  status?: string;
  prioritas?: number;
}
