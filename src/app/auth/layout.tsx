// app/auth/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Jika sudah login, redirect ke dashboard
      router.replace("/dashboard");
      return;
    }

    setIsChecking(false);
  }, [router]);

  // Prevent flash - jangan render apapun saat checking
  if (isChecking) {
    return null;
  }

  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
};

export default AuthLayout;
