"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { companyService } from "@/services/company.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { CreateBranchModal } from "@/components/branch/CreateBranchModal";

const BranchesPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [companyId, setCompanyId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    queryKey: ["branches", companyId, page, limit],
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
        {user.role.name === "OWNER" && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branches List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {branches.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No branches found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>
                          {branch.company ? (
                            <div>
                              <p className="font-medium">{branch.company.name}</p>
                              <p className="text-xs text-gray-500">
                                {branch.company.type}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{branch.address}</p>
                            <p className="text-xs text-gray-500">
                              {branch.postal_code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{branch.city}</p>
                            <p className="text-xs text-gray-500">
                              {branch.province}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{branch.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={branch.is_active ? "default" : "destructive"}
                          >
                            {branch.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(branch.created_at).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {branchResponse?.meta && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Rows per page:</span>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(Number(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-600">
                      {((page - 1) * limit) + 1}-{Math.min(page * limit, branchResponse.meta.total_items)} of {branchResponse.meta.total_items}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(page + 1)}
                        disabled={page === branchResponse.meta.total_pages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(branchResponse.meta.total_pages)}
                        disabled={page === branchResponse.meta.total_pages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateBranchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        companyId={companyId}
      />
    </div>
  );
};

export default BranchesPage;
