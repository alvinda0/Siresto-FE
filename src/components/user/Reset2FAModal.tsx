import React, { useState } from 'react'
import { X } from 'lucide-react'
import { User } from '@/types/user'
import { twoFAService } from '@/services/twofa.service'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'

interface Reset2FAModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
    onSuccess?: () => void
}

export const Reset2FAModal: React.FC<Reset2FAModalProps> = ({
    isOpen,
    onClose,
    user,
    onSuccess
}) => {
    const [reason, setReason] = useState('')
    const [isResetting, setIsResetting] = useState(false)

    if (!isOpen || !user) return null

    const handleReset = async () => {
        if (!reason.trim()) {
            toast.error('Alasan reset harus diisi')
            return
        }

        try {
            setIsResetting(true)

            await twoFAService.resetUserTwoFA({
                user_id: user.user_id,
                method: 'totp',
                reason: reason.trim()
            })

            toast.success('2FA berhasil direset')
            setReason('')
            onSuccess?.()
            onClose()
        } catch (err) {
            const errorMessage = getErrorMessage(err)
            toast.error(errorMessage)
        } finally {
            setIsResetting(false)
        }
    }

    const handleClose = () => {
        if (!isResetting) {
            setReason('')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Reset 2FA</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Reset two-factor authentication for user
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isResetting}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* User Info */}
                    <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-600">Name:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {user.name}
                                </span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {user.email}
                                </span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-600">2FA Status:</span>
                                <span
                                    className={`text-sm font-bold px-2 py-1 rounded ${
                                        user.is_2fa
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {user.is_2fa ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="p-4 bg-orange-50/50 border border-orange-200/50 rounded-xl">
                        <p className="text-sm text-orange-800">
                            <span className="font-semibold">Warning:</span> This action will
                            disable 2FA for this user. They will need to set it up again.
                        </p>
                    </div>

                    {/* Reason Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., User lost access to authenticator device"
                            disabled={isResetting}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Provide a reason for resetting 2FA
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isResetting}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isResetting || !reason.trim()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isResetting ? 'Resetting...' : 'Reset 2FA'}
                    </button>
                </div>
            </div>
        </div>
    )
}