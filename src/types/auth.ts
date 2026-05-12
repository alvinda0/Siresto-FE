// types/auth.ts

// User Type - Updated to match actual API response from /api/v1/auth/me
export interface User {
  user_id: string
  full_name: string
  email: string
  role_name: string
  role_id: string
  status: boolean
}

// Login Types
export interface LoginCredentials {
  email: string
  password: string
}

// API Response Types
export interface LoginResponse {
  status: number
  success: boolean
  message: string
  data: {
    token: string
  }
}

export interface UserResponse {
  status: number
  success: boolean
  message: string
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