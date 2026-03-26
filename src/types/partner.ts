// types/partner.ts

export interface Partner {
    partner_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface PartnerResponse {
    success: boolean;
    message: string;
    data: Partner[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}