"use client";

import { useAuthMe } from "@/hooks/useAuthMe";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Building2, Shield, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePage = () => {
  const { data: user, isLoading } = useAuthMe();
  const { 
    sidebarPrimary,
    sidebarHeaderPrimary,
    sidebarPrimaryForeground,
  } = useTheme();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div 
        className="relative overflow-hidden rounded-xl p-8 shadow-2xl"
        style={{ 
          backgroundColor: sidebarPrimary || '#1E293B',
          color: sidebarPrimaryForeground || '#FFFFFF'
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div 
            className="h-20 w-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <User className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
            <p className="opacity-80">{user.role.display_name}</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-base font-semibold mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-base font-semibold mt-1">-</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="text-base font-mono text-sm mt-1">{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={user.is_active ? "bg-green-500" : "bg-red-500"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company & Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company & Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.company && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-base font-semibold mt-1">{user.company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Type</label>
                  <p className="text-base font-semibold mt-1">{user.company.type}</p>
                </div>
              </>
            )}
            {!user.company && (
              <div>
                <p className="text-sm text-gray-500">Internal user - No company assigned</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </label>
              <p className="text-base font-semibold mt-1">{user.role.display_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role Type</label>
              <div className="mt-1">
                <Badge variant={user.role.type === "INTERNAL" ? "default" : "secondary"}>
                  {user.role.type}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-base font-semibold mt-1">
              {new Date(user.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-base font-semibold mt-1">
              {new Date(user.updated_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Company ID</label>
            <p className="text-base font-mono text-sm mt-1">{user.company_id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
