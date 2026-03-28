"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { companyService } from "@/services/company.service";
import { categoryService } from "@/services/category.service";
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
import { FolderTree, Plus, Search } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EditCategoryModal } from "@/components/category/EditCategoryModal";
import { CreateCategoryModal } from "@/components/category/CreateCategoryModal";
import { DeleteCategoryModal } from "@/components/category/DeleteCategoryModal";
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";

const CategoriesPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [companyId, setCompanyId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Get company first
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getMyCompanies(),
    enabled: !!user,
  });

  // Get branches when company is selected
  const { data: branchResponse } = useQuery({
    queryKey: ["branches", companyId],
    queryFn: () => companyService.getBranchesByCompanyId(companyId),
    enabled: !!companyId,
  });

  useEffect(() => {
    if (companies && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companies]);

  useEffect(() => {
    if (branchResponse?.data && branchResponse.data.length > 0) {
      setBranchId(branchResponse.data[0].id);
    }
  }, [branchResponse]);

  // Get categories
  const {
    data: categoryResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories", branchId, companyId],
    queryFn: () => categoryService.getCategories(branchId, companyId),
    enabled: !!branchId && !!companyId,
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
        title="Failed to load categories"
        description={error?.message || "An error occurred"}
      />
    );
  }

  const categories = categoryResponse?.data || [];
  const branches = branchResponse?.data || [];

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kategori</h1>
          <p className="text-gray-600 mt-1">
            Kelola kategori produk Anda
          </p>
        </div>
        {(user.role.name === "OWNER" || user.role.name === "ADMIN") && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kategori
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cari & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cari Kategori
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari berdasarkan nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {branches.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Cabang
                </label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Daftar Kategori
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center">
              <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? "Tidak ada kategori yang sesuai dengan pencarian" : "Belum ada kategori"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat Pada</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.position}
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        {category.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.is_active ? "default" : "destructive"}
                        >
                          {category.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(category.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {(user.role.name === "OWNER" || user.role.name === "ADMIN") && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsEditModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              Hapus
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        branchId={branchId}
        companyId={companyId}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        branchId={branchId}
        companyId={companyId}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        branchId={branchId}
        companyId={companyId}
      />
    </div>
  );
};

export default CategoriesPage;
