// services/twofa.service.ts
import { apiClient } from '@/lib/axios'
import {
    TwoFASetupPayload,
    TwoFASetupResponse,
    TwoFAVerifyPayload,
    TwoFAVerifyResponse,
    TwoFADisableResponse,
    TwoFASetupData,
    TwoFAData,
    TwoFAStatusResponse,
    TwoFAStatusData,
    TwoFAResetPayload,
    TwoFAResetResponse
} from '@/types/twofa'

class TwoFAService {
    async getStatus(): Promise<TwoFAStatusData> {
        const { data } = await apiClient.get<TwoFAStatusResponse>('/api/v1/2fa/status')
        
        if (data.success && data.data) {
            return data.data
        }

        throw new Error(data.message || 'Failed to get 2FA status')
    }

    async setup(payload: TwoFASetupPayload): Promise<TwoFASetupData> {
        const { data } = await apiClient.post<TwoFASetupResponse>('/api/v1/2fa/setup', payload)

        if (data.success && data.data) {
            return data.data
        }

        throw new Error(data.message || 'Failed to setup 2FA')
    }

    async verify(payload: TwoFAVerifyPayload): Promise<TwoFAData> {
        const { data } = await apiClient.post<TwoFAVerifyResponse>('/api/v1/2fa/verify', payload)

        if (data.success && data.data.twofa) {
            return data.data.twofa
        }

        throw new Error(data.message || 'Failed to verify 2FA')
    }

    async disable(token: string): Promise<boolean> {
        const { data } = await apiClient.post<TwoFADisableResponse>('/api/v1/2fa/disable', {
            method: 'totp',
            token: token
        })

        if (data.success && data.data.disabled) {
            return data.data.disabled
        }

        throw new Error(data.message || 'Failed to disable 2FA')
    }

    async resetUserTwoFA(payload: TwoFAResetPayload): Promise<boolean> {
        const { data } = await apiClient.post<TwoFAResetResponse>('/api/v1/2fa/reset', payload)

        if (data.success && data.data.success) {
            return true
        }

        throw new Error(data.message || 'Failed to reset 2FA')
    }
}

export const twoFAService = new TwoFAService()