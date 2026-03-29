"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { taxService } from "@/services/tax.service";
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
import { Receipt, Plus, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/ui/input";
import { EditTaxModal } from "@/components/tax/EditTaxModal";
import { CreateTaxModal } from "@/components/tax/CreateTaxModal";
import { DeleteTaxModal } from "@/components/tax/DeleteTaxModal";
import { Tax } from "@/types/tax";

const TaxesPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);

  // Get taxes
  const {
    data: taxResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["taxes", page, limit],
    queryFn: () => taxService.getTaxes({ page, limit }),
    enabled: !!user && (user.role.name === "OWNER" || user.role.name === "ADMIN"),
  });

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role.type !== "EXTERNAL") {
      router.push("/dashboard");
      return;
    }

    // Only OWNER and ADMIN can access
    if (user.role.name !== "OWNER" && user.role.name !== "ADMIN") {
      router.push("/home");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <LoadingState />;
  }

  if (user.role.name !== "OWNER" && user.role.name !== "ADMIN") {
    return (
      <ErrorState
        code={403}
        title="Akses Ditolak"
        description="Anda tidak memiliki izin untuk mengakses halaman ini"
      />
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        code={500}
        title="Gagal memuat data pajak"
        description={error?.message || "Terjadi kesalahan"}
      />
    );
  }

  const taxes = taxResponse?.data || [];
  const totalPages = taxResponse?.meta?.total_pages || 1;

  // Filter taxes based on search query
  const filteredTaxes = taxes.filter((tax) =>
    tax.nama_pajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tax.tipe_pajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tax.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tax.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tax.branch_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pajak</h1>
          <p className="text-gray-600 mt-1">
            Kelola pajak dan biaya layanan
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pajak
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Daftar Pajak
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTaxes.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? "Tidak ada pajak yang sesuai dengan pencarian" : "Belum ada pajak"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px] pl-6">Nama Pajak</TableHead>
                      <TableHead className="w-[100px]">Tipe</TableHead>
                      <TableHead className="w-[100px]">Persentase</TableHead>
                      <TableHead className="min-w-[200px]">Deskripsi</TableHead>
                      <TableHead className="min-w-[150px]">Perusahaan</TableHead>
                      <TableHead className="min-w-[150px]">Cabang</TableHead>
                      <TableHead className="w-[100px]">Prioritas</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTaxes.map((tax) => (
                      <TableRow key={tax.id}>
                        <TableCell className="font-medium pl-6">
                          {tax.nama_pajak}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tax.tipe_pajak.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {tax.presentase}%
                        </TableCell>
                        <TableCell>
                          {tax.deskripsi || "-"}
                        </TableCell>
                        <TableCell>
                          {tax.company_name || "-"}
                        </TableCell>
                        <TableCell>
                          {tax.branch_name || <span className="text-gray-400">Company Level</span>}
                        </TableCell>
                        <TableCell>
                          {tax.prioritas}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={tax.status === "active" ? "default" : "destructive"}
                          >
                            {tax.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTax(tax);
                                setIsEditModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setSelectedTax(tax);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {taxResponse?.meta && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Baris per halaman:</span>
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
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-600">
                      {((page - 1) * limit) + 1}-{Math.min(page * limit, taxResponse.meta.total)} dari {taxResponse.meta.total}
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
                        disabled={page === taxResponse.meta.total_pages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(taxResponse.meta.total_pages)}
                        disabled={page === taxResponse.meta.total_pages}
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

      <CreateTaxModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditTaxModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTax(null);
        }}
        tax={selectedTax}
      />

      <DeleteTaxModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTax(null);
        }}
        tax={selectedTax}
      />
    </div>
  );
};

export default TaxesPage;
