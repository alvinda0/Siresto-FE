// types/auth.ts

// User Type - Updated to match new API response
export interface Role {
  id: string
  name: string
  display_name: string
  type: 'INTERNAL' | 'EXTERNAL'
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  type: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  role_id: string
  role: Role
  company_id: string
  company: Company
  is_active: boolean
  created_at: string
  updated_at: string
}

// Login Types
export interface LoginCredentials {
  email: string
  password: string
}

// API Response Types
export interface LoginResponse {
  success: boolean
  message: string
  status: number
  timestamp: string
  data: {
    token: string
  }
}

export interface UserResponse {
  success: boolean
  message: string
  status: number
  timestamp: string
  data: User
}

// Two Factor Authentication Types
export interface VerifyTwoFactorPayload {
  user_id: string
  token: string
}

export interface TwoFactorResponse {
  success: boolean
  message: string
  data: {
    token: string
  }
}

// Change Password Types
export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  twofa_token?: string      // optional TOTP token
  backup_code?: string      // optional backup code (use this instead of the token)
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}

// Forgot Password Types
export interface ForgotPasswordPayload {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

// Reset Password Types
export interface ResetPasswordPayload {
  email: string
  otp: string
  new_password: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

// Register Types
export interface RegisterPayload {
  name: string
  email: string
  password: string
  company_name: string
  company_type: 'PT' | 'CV' | 'PERORANGAN'
}

export interface RegisterResponse {
  success: boolean
  message: string
  status: number
  timestamp: string
  data: {
    user: {
      id: string
      name: string
      email: string
    }
    company: {
      id: string
      name: string
      type: string
    }
  }
}

// Register Types
export interface RegisterPayload {
  name: string
  email: string
  password: string
  company_name: string
  company_type: 'PT' | 'CV' | 'PERORANGAN'
}

export interface RegisterResponse {
  success: boolean
  message: string
  status: number
  timestamp: string
  data: {
    user: {
      id: string
      name: string
      email: string
    }
    company: {
      id: string
      name: string
      type: string
    }
  }
}