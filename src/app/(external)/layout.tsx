// app/(dashboard)/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean | undefined>(undefined);

  // Read sidebar state from cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const sidebarCookie = cookies.find(row => row.startsWith('sidebar_state='));
    const savedState = sidebarCookie ? sidebarCookie.split('=')[1] === 'true' : true;
    setSidebarOpen(savedState);
  }, []);

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

  if (isLoading || isError || !user || sidebarOpen === undefined) {
    return null;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar activeItem={activeMenuName} />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <div className="shrink-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="lg:hidden" />
              <Header />
            </div>
          </div>

          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
