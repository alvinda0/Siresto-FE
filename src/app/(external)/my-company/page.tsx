"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useTheme } from "@/hooks/useTheme";
import { companyService } from "@/services/company.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const MyCompanyPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const { 
    sidebarPrimary,
    sidebarHeaderPrimary,
    sidebarPrimaryForeground,
  } = useTheme();

  const {
    data: companies,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getMyCompanies(),
    enabled: !!user,
  });

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role.type !== "EXTERNAL") {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <LoadingState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        code={500}
        title="Failed to load companies"
        description={error?.message || "An error occurred"}
      />
    );
  }

  const company = companies?.[0];

  if (!company) {
    return (
      <ErrorState
        code={404}
        title="No Company Found"
        description="You don't have any company associated with your account"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Company Info */}
      <div 
        className="relative overflow-hidden rounded-xl p-8 shadow-2xl"
        style={{ 
          backgroundColor: sidebarPrimary || '#1E293B',
          color: sidebarPrimaryForeground || '#FFFFFF'
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="opacity-80 text-sm">{company.type}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="opacity-80 text-sm mb-1">Owner</p>
              <p className="text-lg font-semibold">{company.owner.name}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="opacity-80 text-sm mb-1">Role</p>
              <p className="text-lg font-semibold">{company.owner.role.display_name}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="opacity-80 text-sm mb-1">Total Branches</p>
              <p className="text-lg font-semibold">{company.branches?.length || 0} Cabang</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branches Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Branch Network</h2>
            <p className="text-gray-600 text-sm mt-1">Lokasi cabang perusahaan Anda</p>
          </div>
        </div>

        {/* Branch Cards with Blueprint Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.branches?.map((branch, index) => (
            <Card 
              key={branch.id} 
              className="group hover:shadow-xl transition-all duration-300 border-2 relative overflow-hidden"
              style={{
                borderColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${sidebarPrimary}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* Branch Number Badge */}
              <div 
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
                style={{
                  backgroundColor: sidebarHeaderPrimary,
                  color: sidebarPrimaryForeground
                }}
              >
                {index + 1}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div 
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: `${sidebarPrimary}20`,
                    }}
                  >
                    <Building2 
                      className="h-5 w-5" 
                      style={{ color: sidebarHeaderPrimary }}
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{branch.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          branch.is_active
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                        }`}
                      >
                        {branch.is_active ? "● Active" : "● Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Address */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start gap-2">
                    <MapPin 
                      className="h-4 w-4 mt-0.5 flex-shrink-0" 
                      style={{ color: sidebarHeaderPrimary }}
                    />
                    <div className="text-sm flex-1">
                      <p className="font-medium text-gray-900">{branch.address}</p>
                      <p className="text-gray-600 mt-1">
                        {branch.city}, {branch.province}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Kode Pos: {branch.postal_code}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-sm">
                  <div 
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${sidebarPrimary}20`,
                    }}
                  >
                    <Phone 
                      className="h-4 w-4" 
                      style={{ color: sidebarHeaderPrimary }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Telepon</p>
                    <p className="font-medium text-gray-900">{branch.phone}</p>
                  </div>
                </div>

                {/* Decorative Line */}
                <div className="border-t-2 border-dashed border-gray-200 pt-3">
                  <p className="text-xs text-gray-400 text-center">
                    Branch ID: {branch.id.substring(0, 8)}...
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(!company.branches || company.branches.length === 0) && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Cabang
              </h3>
              <p className="text-gray-600 text-sm">
                Perusahaan Anda belum memiliki cabang terdaftar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyCompanyPage;
