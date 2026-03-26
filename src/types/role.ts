// types/role.ts
export interface Role {
    role_id: string;
    role_name: string;
    priority: number;
    is_internal: boolean;
    is_staff: boolean;
    is_client: boolean;
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