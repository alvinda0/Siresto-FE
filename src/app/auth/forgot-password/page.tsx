"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { get } from "http";
import { getErrorMessage } from "@/lib/utils";

const ForgotResetPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      toast.success("Reset code sent to your email");
      setStep("otp");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP code is required");
      return;
    }

    if (otp.length < 4) {
      setError("Please enter a valid OTP code");
      return;
    }

    // Just move to next step, validation will happen on final submit
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email,
        otp,
        new_password: newPassword,
      });
      setSuccess(true);
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const handleBackToOtp = () => {
    setStep("otp");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const getStepIcon = () => {
    switch (step) {
      case "email":
        return <Mail className="w-8 h-8 text-blue-400" />;
      case "otp":
        return <ShieldCheck className="w-8 h-8 text-blue-400" />;
      case "password":
        return <KeyRound className="w-8 h-8 text-blue-400" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Forgot Password?";
      case "otp":
        return "Verify OTP";
      case "password":
        return "Create New Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "email":
        return "No worries! Enter your email and we'll send you reset instructions";
      case "otp":
        return "Enter the OTP code we sent to your email";
      case "password":
        return "Enter your new password";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 mb-4">
              {getStepIcon()}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getStepTitle()}
            </h1>
            <p className="text-gray-400 text-sm">{getStepDescription()}</p>
          </div>

          {/* Progress Steps */}
          {step !== "email" && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                    step === "otp"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {step === "password" ? "✓" : "1"}
                </div>
                <div
                  className={`h-1 w-12 ${
                    step === "password" ? "bg-blue-600" : "bg-gray-600"
                  }`}
                ></div>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                    step === "password"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-gray-400"
                  }`}
                >
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 px-4">
                <span className="text-xs text-gray-400">OTP</span>
                <span className="text-xs text-gray-400">Password</span>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 bg-green-900/20 border-green-700 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Password reset successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Step Form */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          )}

          {/* OTP Step Form */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-sm text-blue-300">
                  OTP code has been sent to{" "}
                  <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-200">
                  OTP Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest"
                  disabled={isLoading}
                  autoComplete="off"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">
                  Check your email for the OTP code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Send
              </Button>

              <button
                type="button"
                onClick={handleBackToEmail}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                Use different email
              </button>
            </form>
          )}

          {/* Password Step Form */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-200">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    disabled={isLoading || success}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                    disabled={isLoading || success}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">At least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    disabled={isLoading || success}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                    disabled={isLoading || success}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Success!
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              {!isLoading && !success && (
                <button
                  type="button"
                  onClick={handleBackToOtp}
                  className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to OTP verification
                </button>
              )}
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="flex items-center justify-center text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              {step === "email" &&
                "Didn&apos;t receive the email? Check your spam folder or try again"}
              {step === "otp" && (
                <>
                  Didn&apos;t receive the code?{" "}
                  <button
                    onClick={handleBackToEmail}
                    className="text-blue-400 hover:text-blue-300"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotResetPasswordPage;
