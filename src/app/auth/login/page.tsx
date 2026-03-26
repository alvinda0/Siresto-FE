"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({ email, password });
      toast.success("Login berhasil!");
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render login form
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Siresto
            </h1>
          </div>

          {/* Description */}
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Kelola Bisnis Restoran Anda dengan Mudah
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Platform manajemen restoran yang powerful dan intuitif. Pantau penjualan, kelola inventori, dan tingkatkan efisiensi operasional Anda.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Dashboard Real-time</h3>
                <p className="text-slate-400 text-sm">Monitor performa bisnis Anda secara langsung</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Keamanan Terjamin</h3>
                <p className="text-slate-400 text-sm">Dilindungi dengan enkripsi dan 2FA</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Laporan Lengkap</h3>
                <p className="text-slate-400 text-sm">Analisis mendalam untuk keputusan bisnis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 shadow-lg shadow-blue-500/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              Siresto
            </h1>
            <p className="text-slate-400 text-sm">Admin Portal</p>
          </div>

          <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Selamat Datang Kembali
              </h2>
              <p className="text-slate-400 text-sm">
                Masuk untuk mengakses dashboard internal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@siresto.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/70 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12 rounded-xl transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900/70 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 pr-12 h-12 rounded-xl transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right mt-2">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8">
              {/* Register Link */}
              <div className="text-center pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm">
                  Belum punya akun?{" "}
                  <Link
                    href="/auth/register"
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline"
                  >
                    Daftar Sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-xs">
              © 2024 Siresto. Semua akses dipantau dan dicatat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;