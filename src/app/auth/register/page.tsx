"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Shield, UserPlus, Building2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const RegisterPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    company_type: "PT" as "PT" | "CV" | "PERORANGAN",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      toast.error("Nama dan email harus diisi");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.company_name) {
      toast.error("Nama perusahaan harus diisi");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.password || !formData.confirmPassword) {
      toast.error("Password harus diisi");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        company_type: formData.company_type,
      });
      
      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/auth/login");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
            Bergabung dengan Siresto
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Daftar sekarang dan mulai kelola restoran Anda dengan sistem yang terintegrasi dan mudah digunakan.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Gratis untuk Memulai</h3>
                <p className="text-slate-400 text-sm">Tidak ada biaya tersembunyi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Setup Cepat</h3>
                <p className="text-slate-400 text-sm">Mulai dalam hitungan menit</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Support 24/7</h3>
                <p className="text-slate-400 text-sm">Tim kami siap membantu Anda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">
                  Buat Akun Baru
                </h2>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200 font-medium">
                      Nama Lengkap
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-slate-900/70 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12 rounded-xl transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@siresto.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-slate-900/70 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12 rounded-xl transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] mt-6"
                  >
                    Lanjut
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Step 2: Company Info */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Company Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-slate-200 font-medium">
                      Nama Perusahaan
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      type="text"
                      placeholder="PT Maju Sejahtera"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="bg-slate-900/70 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12 rounded-xl transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Company Type Field */}
                  <div className="space-y-2">
                    <Label htmlFor="company_type" className="text-slate-200 font-medium">
                      Jenis Perusahaan
                    </Label>
                    <select
                      id="company_type"
                      name="company_type"
                      value={formData.company_type}
                      onChange={handleChange}
                      className="w-full bg-slate-900/70 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12 rounded-xl transition-all px-4"
                      disabled={isLoading}
                    >
                      <option value="PT">PT (Perseroan Terbatas)</option>
                      <option value="CV">CV (Commanditaire Vennootschap)</option>
                      <option value="PERORANGAN">Perorangan</option>
                    </select>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 bg-slate-900/50 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 py-6 rounded-xl transition-all"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Kembali
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
                    >
                      Lanjut
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Security */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        value={formData.password}
                        onChange={handleChange}
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
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                      Konfirmasi Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Masukkan password lagi"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="bg-slate-900/70 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 pr-12 h-12 rounded-xl transition-all"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 bg-slate-900/50 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 py-6 rounded-xl transition-all"
                      disabled={isLoading}
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Mendaftar...
                        </>
                      ) : (
                        "Daftar Sekarang"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="mt-8">
              {/* Login Link */}
              <div className="text-center pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm">
                  Sudah punya akun?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline"
                  >
                    Masuk di sini
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

export default RegisterPage;
