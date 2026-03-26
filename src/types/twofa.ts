// types/twofa.ts
export interface TwoFASetupPayload {
    method: 'totp'
}

export interface TwoFASetupData {
    method: string
    qr_code_url: string
    qr_code_base64: string
}

export interface TwoFASetupResponse {
    success: boolean
    message: string
    data: TwoFASetupData
}

export interface TwoFAVerifyPayload {
    method: 'totp'
    token: string
}

export interface TwoFAData {
    id: number
    user_id: string
    secret: string
    backup_codes: string[]
    backup_codes_total: number
    backup_codes_used: number
    method: string
    enabled: boolean
    verified_at: string
    created_at: string
    updated_at: string
}

export interface TwoFAVerifyResponse {
    success: boolean
    message: string
    data: {
        twofa: TwoFAData
    }
}

export interface TwoFADisablePayload {
    method: 'totp'
    token: string
}

export interface TwoFADisableResponse {
    success: boolean
    message: string
    data: {
        disabled: boolean
    }
}

export interface BackupStatus {
    total: number
    used: number
    remaining: number
}

// Updated to match actual API response
export interface TwoFAStatusData {
    enabled: boolean
    backup_status?: BackupStatus
    twofa?: TwoFAData
}

export interface TwoFAStatusResponse {
    success: boolean
    message: string
    data: TwoFAStatusData
}

export interface TwoFAResetPayload {
    user_id: string
    method: 'totp'
    reason: string
}

export interface TwoFAResetResponse {
    success: boolean
    message: string
    data: {
        success: boolean
        message: string
        user_id: string
    }
}