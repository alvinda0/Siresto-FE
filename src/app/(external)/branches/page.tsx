"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { companyService } from "@/services/company.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Building2, Plus } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { CreateBranchModal } from "@/components/branch/CreateBranchModal";

const BranchesPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [companyId, setCompanyId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get company first
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getMyCompanies(),
    enabled: !!user,
  });

  useEffect(() => {
    if (companies && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companies]);

  // Get branches
  const {
    data: branchResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["branches", companyId],
    queryFn: () => companyService.getBranchesByCompanyId(companyId),
    enabled: !!companyId,
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
        title="Failed to load branches"
        description={error?.message || "An error occurred"}
      />
    );
  }

  const branches = branchResponse?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-gray-600 mt-1">
            Manage your company branches
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {branches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No branches found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{branch.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      branch.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {branch.is_active ? "Active" : "Inactive"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {branch.company && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Company
                    </label>
                    <p className="text-sm font-semibold">{branch.company.name}</p>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{branch.address}</p>
                    <p className="text-gray-600">
                      {branch.city}, {branch.province}
                    </p>
                    <p className="text-gray-600">{branch.postal_code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="text-sm">{branch.phone}</p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(branch.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {branchResponse?.meta && (
        <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
          <span>
            Page {branchResponse.meta.page} of {branchResponse.meta.total_pages}
          </span>
          <span>•</span>
          <span>Total: {branchResponse.meta.total_items} branches</span>
        </div>
      )}

      <CreateBranchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        companyId={companyId}
      />
    </div>
  );
};

export default BranchesPage;
