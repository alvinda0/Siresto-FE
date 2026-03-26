// app/(dashboard)/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getMenuItemByPath } from "@/constants/menuItems";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useAuthMe();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      queryClient.clear();
      router.replace("/auth/login");
      return;
    }

    if (!isLoading && (isError || !user)) {
      queryClient.clear();
      localStorage.removeItem("token");
      router.replace("/auth/login");
    }
  }, [isLoading, isError, user, router, queryClient]);

  const { menuItem } = getMenuItemByPath(pathname);
  const activeMenuName = menuItem?.name || "Dashboard";

  if (isLoading || isError || !user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative w-full h-screen overflow-hidden bg-slate-50">
        {/* ✅ Gradasi dihilangkan */}

        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40 p-3">
          <div className="h-full overflow-y-auto bg-white shadow-lg border border-gray-200/50">
            <AppSidebar activeItem={activeMenuName} />
          </div>
        </div>

        <div className="w-full h-full flex flex-col lg:pl-[300px]">
          <div className="shrink-0 bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-sm">
            <Header />
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
