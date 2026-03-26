// services/role.service.ts
import { apiClient } from '@/lib/axios';
import { Role, RoleResponse } from '@/types/role';

class RoleService {
    async getRoles(): Promise<Role[]> {
        const { data } = await apiClient.get<RoleResponse>('/api/v1/roles', {
            params: { limit: 100 }
        });

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || 'Failed to fetch roles');
    }

    async getRoleById(id: number): Promise<Role | undefined> {
        const roles = await this.getRoles();
        return roles.find(role => role.role_id === id.toString());
    }

    async getRoleByName(name: string): Promise<Role | undefined> {
        const roles = await this.getRoles();
        return roles.find(role => role.role_name.toLowerCase() === name.toLowerCase());
    }
}

export const roleService = new RoleService();