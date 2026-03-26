"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { userService } from "@/services/user.service";
import { companyService } from "@/services/company.service";
import { toast } from "sonner";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    company_id: "",
    branch_id: "",
  });

  // Get companies
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getMyCompanies(),
    enabled: isOpen,
  });

  // Get roles
  const { data: rolesResponse } = useQuery({
    queryKey: ["roles"],
    queryFn: () => companyService.getRoles(),
    enabled: isOpen,
  });

  // Get branches based on selected company
  const { data: branchesResponse } = useQuery({
    queryKey: ["branches", formData.company_id],
    queryFn: () => companyService.getBranchesByCompanyId(formData.company_id),
    enabled: !!formData.company_id && isOpen,
  });

  // Set default company when companies are loaded
  useEffect(() => {
    if (companies && companies.length > 0 && !formData.company_id) {
      setFormData((prev) => ({
        ...prev,
        company_id: companies[0].id,
      }));
    }
  }, [companies, formData.company_id]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role_id: data.role_id,
        company_id: data.company_id,
        ...(data.branch_id && { branch_id: data.branch_id }),
      };
      return userService.createExternalUser(payload);
    },
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["external-users"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create user");
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role_id: "",
      company_id: "",
      branch_id: "",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const roles = rolesResponse?.data || [];
  const branches = branchesResponse?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g., john@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="role_id">Role</Label>
          <Select
            value={formData.role_id}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, role_id: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles
                .filter((role) => role.type === "EXTERNAL" && role.is_active)
                .map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.display_name} - {role.description}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="company_id">Company</Label>
          <Select
            value={formData.company_id}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, company_id: value, branch_id: "" }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies?.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name} ({company.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="branch_id">Branch (Optional)</Label>
          <Select
            value={formData.branch_id || "none"}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, branch_id: value === "none" ? "" : value }))
            }
            disabled={!formData.company_id || branches.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Branch</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name} - {branch.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
