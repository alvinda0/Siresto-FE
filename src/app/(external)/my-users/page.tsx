"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { userService } from "@/services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { CreateUserModal } from "@/components/user/CreateUserModal";

const ExternalUsersPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["external-users", page, limit],
    queryFn: () => userService.getExternalUsers({ page, limit }),
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
        title="Failed to load users"
        description={error?.message || "An error occurred"}
      />
    );
  }

  const users = usersResponse?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600 mt-1">
            View all users in your organization
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.role.display_name}</p>
                            <p className="text-xs text-gray-500">
                              {user.role.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.company ? (
                            <div>
                              <p className="font-medium">{user.company.name}</p>
                              <p className="text-xs text-gray-500">
                                {user.company.type}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.branch ? (
                            <div>
                              <p className="font-medium">{user.branch.name}</p>
                              <p className="text-xs text-gray-500">
                                {user.branch.city}, {user.branch.province}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.is_active ? "default" : "destructive"}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString("id-ID", {
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
              {usersResponse?.meta && (
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
                      {((page - 1) * limit) + 1}-{Math.min(page * limit, usersResponse.meta.total_items)} of {usersResponse.meta.total_items}
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
                        disabled={page === usersResponse.meta.total_pages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(usersResponse.meta.total_pages)}
                        disabled={page === usersResponse.meta.total_pages}
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

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default ExternalUsersPage;
