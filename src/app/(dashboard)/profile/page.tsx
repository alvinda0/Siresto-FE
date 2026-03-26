// pages/ProfilePage.tsx
"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { pinService } from "@/services/pin.service";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTheme } from "@/hooks/useTheme";
import { User } from "@/types/auth";
import {
  Shield,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  CreatePinModal,
  UpdatePinModal,
  DeletePinModal,
} from "@/components/profile/PinModals";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

type ModalType = "create" | "update" | "delete" | null;

export default function ProfilePage() {
  usePageTitle("Profile");
  const { buttonPrimaryColor, secondaryTextColor, primaryColor } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [hasPinEnabled, setHasPinEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);

      if (userData) {
        try {
          const pinStatus = await pinService.checkPinStatus();
          setHasPinEnabled(pinStatus);
        } catch (pinError) {
          const errorMessage = getErrorMessage(pinError);
          toast.error(errorMessage);
          setHasPinEnabled(false);
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePin = async (data: Record<string, string>) => {
    setActionLoading(true);
    try {
      await pinService.createPin(data as { pin: string; password: string });
      toast.success("PIN created successfully");
      setHasPinEnabled(true);
      setActiveModal(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePin = async (data: Record<string, string>) => {
    setActionLoading(true);
    try {
      await pinService.updatePin(
        data as { old_pin: string; new_pin: string; password: string }
      );
      toast.success("PIN updated successfully");
      setActiveModal(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePin = async (data: Record<string, string>) => {
    setActionLoading(true);
    try {
      await pinService.deletePin(data as { pin: string; password: string });
      toast.success("PIN deleted successfully");
      setHasPinEnabled(false);
      setActiveModal(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to fetch user data
          </p>
          <button
            onClick={fetchUserData}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: buttonPrimaryColor,
              color: secondaryTextColor,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Profile Information Card */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: primaryColor }}>
            <div className="flex items-center gap-3">
              <UserIcon
                className="w-8 h-8"
                style={{ color: secondaryTextColor }}
              />
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: secondaryTextColor }}
                >
                  Profile
                </h1>
                <p
                  className="text-sm opacity-80"
                  style={{ color: secondaryTextColor }}
                >
                  Manage your account information
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Name
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {user.name || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Role
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {user.role_name || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  User ID
                </label>
                <p className="text-base text-gray-900 dark:text-white font-mono break-all">
                  {user.user_id || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Account Status
                </label>
                <div className="flex items-center gap-2">
                  {user.is_verified ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-base text-gray-900 dark:text-white">
                        Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-base text-gray-900 dark:text-white">
                        Not Verified
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Two-Factor Authentication
                </label>
                <div className="flex items-center gap-2">
                  {user.is_2fa ? (
                    <>
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-base text-gray-900 dark:text-white">
                        Enabled
                      </span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 text-gray-400" />
                      <span className="text-base text-gray-900 dark:text-white">
                        Disabled
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIN Management Card */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: primaryColor }}>
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8" style={{ color: secondaryTextColor }} />
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: secondaryTextColor }}
                >
                  PIN Security
                </h2>
                <p
                  className="text-sm opacity-80"
                  style={{ color: secondaryTextColor }}
                >
                  Manage your security PIN
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                PIN Status:
                <span
                  className={`ml-2 font-medium ${
                    hasPinEnabled
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {hasPinEnabled ? "Active" : "Not Set"}
                </span>
              </p>
            </div>

            {!hasPinEnabled ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg backdrop-blur-sm">
                  <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Enhance Your Security
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Set up a 6-digit PIN to add an extra layer of protection to
                    your account.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal("create")}
                  className="w-full py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
                  style={{
                    backgroundColor: buttonPrimaryColor,
                    color: secondaryTextColor,
                  }}
                >
                  Create PIN
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50/80 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg backdrop-blur-sm">
                  <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">
                    ✅ PIN Security is Active
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-400">
                    Your account is protected with a security PIN.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveModal("update")}
                    className="py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
                    style={{
                      backgroundColor: buttonPrimaryColor,
                      color: secondaryTextColor,
                    }}
                  >
                    Update PIN
                  </button>
                  <button
                    onClick={() => setActiveModal("delete")}
                    className="py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all duration-200 shadow-lg shadow-red-500/30"
                  >
                    Delete PIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePinModal
        isOpen={activeModal === "create"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleCreatePin}
        loading={actionLoading}
      />

      <UpdatePinModal
        isOpen={activeModal === "update"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleUpdatePin}
        loading={actionLoading}
      />

      <DeletePinModal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleDeletePin}
        loading={actionLoading}
      />
    </div>
  );
}
