"use client";
// pages/TwoFactorAuthPage.tsx
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { twoFAService } from "@/services/twofa.service";
import { TwoFASetupData, TwoFAStatusData } from "@/types/twofa";
import { usePageTitle } from "@/hooks/usePageTitle";
import PinInputDialog from "@/components/PinInputDialog";
import { toast } from "sonner";
import { get } from "http";
import { getErrorMessage } from "@/lib/utils";

export default function TwoFactorAuthPage() {
  usePageTitle("2FA");
  const [statusData, setStatusData] = useState<TwoFAStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Setup states
  const [setupData, setSetupData] = useState<TwoFASetupData | null>(null);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [verifyError, setVerifyError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Disable states
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  // Success states
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await twoFAService.getStatus();
      setStatusData(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setActionLoading(true);
      setVerifyError("");
      const data = await twoFAService.setup({ method: "totp" });
      setSetupData(data);
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setVerifyError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = [...pin];
    for (let i = 0; i < pastedData.length; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    const pinValue = pin.join("");
    if (pinValue.length !== 6) {
      setVerifyError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setActionLoading(true);
      setVerifyError("");
      const data = await twoFAService.verify({
        method: "totp",
        token: pinValue,
      });

      setBackupCodes(data.backup_codes);
      setShowBackupCodes(true);
      setSetupData(null);
      setPin(["", "", "", "", "", ""]);
      toast.success("2FA enabled successfully!");

      // Refresh status data
      await fetchStatus();
    } catch (error) {
      const message = getErrorMessage(error);
      setVerifyError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable2FA = async (pin: string) => {
    try {
      setActionLoading(true);
      await twoFAService.disable(pin);

      toast.success("2FA disabled successfully");
      setShowDisableDialog(false);

      // Refresh status data
      await fetchStatus();
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      console.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  const copyBackupCodes = () => {
    const text = backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Backup codes copied to clipboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if 2FA is enabled
  const is2FAEnabled = statusData?.enabled || false;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Two-Factor Authentication
          </h1>

          {/* Status Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              2FA Status:
              <span
                className={`ml-2 font-medium ${
                  is2FAEnabled ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {is2FAEnabled ? "Enabled" : "Disabled"}
              </span>
            </p>
            {is2FAEnabled && statusData?.backup_status && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Backup Codes:{" "}
                  <span className="font-medium">
                    {statusData.backup_status.remaining}/
                    {statusData.backup_status.total} remaining
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Show Backup Codes Modal */}
          {showBackupCodes && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                ✅ 2FA Enabled Successfully!
              </h2>
              <p className="text-sm text-green-800 mb-4">
                Save these backup codes in a safe place. You can use them to
                access your account if you lose your authenticator device.
              </p>

              <div className="bg-white p-4 rounded border border-green-300 mb-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="text-gray-700">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadBackupCodes}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Download Codes
                </button>
                <button
                  onClick={copyBackupCodes}
                  className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowBackupCodes(false)}
                  className="ml-auto px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Enable 2FA Section */}
          {!is2FAEnabled && !setupData && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Enhance Your Account Security
                </h3>
                <p className="text-sm text-blue-800">
                  Two-factor authentication adds an extra layer of security to
                  your account by requiring a verification code from your
                  authenticator app.
                </p>
              </div>

              <button
                onClick={handleSetup2FA}
                disabled={actionLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                {actionLoading
                  ? "Setting up..."
                  : "Enable Two-Factor Authentication"}
              </button>
            </div>
          )}

          {/* Setup QR Code Section */}
          {setupData && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">
                  Step 1: Scan QR Code
                </h3>
                <p className="text-sm text-yellow-800">
                  Use your authenticator app (Google Authenticator, Authy, etc.)
                  to scan this QR code.
                </p>
              </div>

              <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                <Image
                  src={`data:image/png;base64,${setupData.qr_code_base64}`}
                  alt="2FA QR Code"
                  width={256}
                  height={256}
                  className="w-64 h-64"
                />
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Step 2: Enter Verification Code
                  </label>
                  <div
                    className="flex gap-2 justify-center"
                    onPaste={handlePinPaste}
                  >
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        disabled={actionLoading}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    ))}
                  </div>
                  {verifyError && (
                    <p className="mt-3 text-sm text-red-600 text-center">
                      {verifyError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading || pin.some((d) => d === "")}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {actionLoading ? "Verifying..." : "Verify and Enable 2FA"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSetupData(null);
                      setPin(["", "", "", "", "", ""]);
                      setVerifyError("");
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Disable 2FA Section */}
          {is2FAEnabled && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  ✅ Two-Factor Authentication is Active
                </h3>
                <p className="text-sm text-green-800">
                  Your account is protected with an additional layer of
                  security.
                </p>
              </div>

              <button
                onClick={() => setShowDisableDialog(true)}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
              >
                Disable Two-Factor Authentication
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white shadow rounded-lg p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            About Two-Factor Authentication
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Two-factor authentication (2FA) requires you to provide a
              verification code from your authenticator app in addition to your
              password when logging in.
            </p>
            <p>
              <strong>Recommended authenticator apps:</strong>
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Google Authenticator</li>
              <li>Microsoft Authenticator</li>
              <li>Authy</li>
              <li>1Password</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disable 2FA Dialog */}
      <PinInputDialog
        isOpen={showDisableDialog}
        onClose={() => setShowDisableDialog(false)}
        onConfirm={handleDisable2FA}
        title="Disable Two-Factor Authentication"
        description="Disabling 2FA will make your account less secure. Enter your authenticator code to confirm."
        isLoading={actionLoading}
        actionType="delete"
        actionLabel="Disable 2FA"
        loadingLabel="Disabling..."
      />
    </div>
  );
}
