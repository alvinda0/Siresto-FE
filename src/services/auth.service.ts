// services/auth.service.ts
import { apiClient } from '@/lib/axios'
import {
  LoginCredentials,
  LoginResponse,
  TwoFactorResponse,
  VerifyTwoFactorPayload,
  User,
  UserResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  RegisterPayload,
  RegisterResponse
} from '@/types/auth'

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await apiClient.post<LoginResponse>(
        '/api/v1/login',
        credentials
      )

      if (data.success && data.data.token) {
        localStorage.setItem('token', data.data.token)
        return data
      }

      throw new Error(data.message || 'Login failed')
    } catch (error: any) {
      // Handle error response structure: {"success": false, "error": {"code": "...", "message": "..."}}
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message)
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Network error occurred')
    }
  }

  async verifyTwoFactor(payload: VerifyTwoFactorPayload): Promise<string> {
    try {
      const { data } = await apiClient.post<TwoFactorResponse>(
        '/api/v1/auth/login/verify',
        payload
      )

      if (data.success && data.data.token) {
        localStorage.setItem('token', data.data.token)
        return data.data.token
      }

      throw new Error(data.message || '2FA verification failed')
    } catch (error: any) {
      // Handle error response structure
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message)
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || '2FA verification failed')
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const { data } = await apiClient.get<UserResponse>('/api/v1/auth/me')

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch user')
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw error
      }

      // Handle error response structure
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message)
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Failed to fetch user data')
    }
  }

  isInternalUser(user: User): boolean {
    return user.role.type === 'INTERNAL'
  }

  isExternalUser(user: User): boolean {
    return user.role.type === 'EXTERNAL'
  }

  getDashboardRoute(user: User): string {
    if (this.isInternalUser(user)) {
      return '/internal'
    }
    return '/dashboard'
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<string> {
    const { data } = await apiClient.post<ForgotPasswordResponse>(
      '/api/v1/auth/forget-password',
      payload
    )

    if (data.success) {
      return data.message
    }

    throw new Error(data.message || 'Failed to send reset email')
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<string> {
    const { data } = await apiClient.post<ResetPasswordResponse>(
      '/api/v1/auth/reset-password',
      payload
    )

    if (data.success) {
      return data.message
    }

    throw new Error(data.message || 'Failed to reset password')
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    try {
      const { data } = await apiClient.post<ChangePasswordResponse>(
        '/api/v1/auth/change-password',
        payload
      )

      if (!data.success) {
        throw new Error(data.message || 'Failed to change password')
      }
    } catch (error: any) {
      // Handle error response structure
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message)
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Failed to change password')
    }
  }

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    try {
      const { data } = await apiClient.post<RegisterResponse>(
        '/api/v1/register',
        payload
      )

      if (data.success) {
        return data
      }

      throw new Error(data.message || 'Registration failed')
    } catch (error: any) {
      // Handle error response structure
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message)
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Registration failed')
    }
  }

  logout(): void {
    localStorage.removeItem('token')
  }
}

export const authService = new AuthService()