// components/user/ResetPinModal.tsx
"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ShieldAlert, Loader2, XCircle, User } from 'lucide-react'
import { pinService } from '@/services/pin.service'
import { User as UserType } from '@/types/user'
import { ResetPinPayload } from '@/types/pin'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'

interface ResetPinModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType | null
}

export const ResetPinModal: React.FC<ResetPinModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  const handleClose = () => {
    if (loading) return
    setReason('')
    setReasonError(null)
    setError(null)
    onClose()
  }

  const validateForm = (): boolean => {
    if (!reason || !reason.trim()) {
      setReasonError('Reason is required')
      return false
    }

    if (reason.trim().length < 10) {
      setReasonError('Reason must be at least 10 characters')
      return false
    }

    setReasonError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('User data is missing')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload: ResetPinPayload = {
        user_id: user.user_id,
        reason: reason.trim(),
      }

      await pinService.resetPin(payload)

      toast.success(`PIN berhasil direset untuk ${user.name}`, {
        description: 'User akan diminta membuat PIN baru saat login',
      })

      handleClose()
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (roleId: string): string => {
    const colors: { [key: string]: string } = {
      'f077e798-b600-4e8c-800c-d7237e8559bc': 'text-red-700 bg-red-50',
      '6a2028e4-4289-4910-9f07-1ea4dcf26914': 'text-orange-700 bg-orange-50',
      '45f8c67e-5beb-4522-a123-0374c9a9dead': 'text-blue-700 bg-blue-50',
      'd871483a-b57b-4a4c-84ea-1a21bd66df42': 'text-yellow-700 bg-yellow-50',
      'efc07a01-1d54-4843-97ec-8365455fde8d': 'text-indigo-700 bg-indigo-50',
      '17f07374-3cba-47df-bce1-080fed5c0680': 'text-cyan-700 bg-cyan-50',
      '6452b2bc-066d-4e52-907e-83fc7d61b84e': 'text-purple-700 bg-purple-50',
      'e17908d5-c18e-4c5e-b6c9-b83afe2d49f8': 'text-pink-700 bg-pink-50',
      '5f8ab095-4edb-4d21-978c-0dd1e104c9bb': 'text-slate-700 bg-slate-50',
    }
    return colors[roleId] || 'text-gray-700 bg-gray-50'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Reset User PIN</DialogTitle>
              <DialogDescription>
                Reset PIN untuk user yang dipilih
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                User Information
              </Label>
              <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-lg mb-1">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${getRoleColor(
                          user.role_id || ''
                        )}`}
                      >
                        {user.role_name}
                      </span>
                      {user.is_internal && (
                        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">
                          Internal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reset-reason" className="flex items-center gap-2">
              Alasan Reset PIN
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reset-reason"
              placeholder="Masukkan alasan detail kenapa PIN perlu direset (minimal 10 karakter)"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (reasonError) setReasonError(null)
              }}
              className={`min-h-[120px] ${
                reasonError ? 'border-red-500' : ''
              }`}
              disabled={loading}
            />
            {reasonError && (
              <p className="text-sm text-red-600">{reasonError}</p>
            )}
            <p className="text-xs text-gray-500">
              Berikan alasan yang jelas mengapa reset PIN diperlukan
            </p>
          </div>

          {/* Warning Message */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Peringatan</p>
                <p>
                  Tindakan ini akan mereset PIN user. User akan diminta untuk
                  membuat PIN baru saat login berikutnya.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mereset PIN...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Reset PIN
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}