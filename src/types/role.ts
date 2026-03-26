// types/role.ts
export interface Role {
    role_id: string;
    role_name: string;
    priority: number;
    is_internal: boolean;
    is_staff: boolean;
    is_client: boolean;
}

export interface ExternalRole {
    id: string;
    name: string;
    display_name: string;
    type: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface RoleResponse {
    success: boolean;
    message: string;
    data: Role[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}