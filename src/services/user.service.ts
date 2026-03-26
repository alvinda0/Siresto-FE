// services/user.service.ts

import { apiClient } from '@/lib/axios';
import {
  User,
  UserResponse,
  UserDetailResponse,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/types/user';

class UserService {
  /**
   * Get all users with optional filters
   * Returns full response including metadata and roles statistics for pagination
   */
  async getUsers(params?: UserQueryParams): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(
      '/api/v1/internal/users',
      { params }
    );
    return data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const { data } = await apiClient.get<UserDetailResponse>(
      `/api/v1/internal/users/${userId}`
    );
    return Array.isArray(data.data) ? data.data[0] : data.data;
  }

  /**
   * Create new user
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const { data } = await apiClient.post<UserDetailResponse>(
      '/api/v1/internal/users',
      payload
    );
    return Array.isArray(data.data) ? data.data[0] : data.data;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await apiClient.put<UserDetailResponse>(
      `/api/v1/internal/users/${userId}`,
      payload
    );
    return Array.isArray(data.data) ? data.data[0] : data.data;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete<UserDetailResponse>(
      `/api/v1/internal/users/${userId}`
    );
  }

  /**
   * Unblock user
   */
  async unblockUser(userId: string): Promise<void> {
    await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/internal/users/${userId}/unblock`
    );
  }

  /**
   * Check client IP address
   */
  async checkClientIp(): Promise<{ 
    client_ip: string; 
    raw_remote_addr: string; 
    x_forwarded_for: string; 
    x_real_ip: string 
  }> {
    const { data } = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        client_ip: string;
        raw_remote_addr: string;
        x_forwarded_for: string;
        x_real_ip: string;
      };
    }>('/api/v1/users/check-ip');
    return data.data;
  }
}

export const userService = new UserService();