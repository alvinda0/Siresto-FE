"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyService } from "@/services/company.service";
import { toast } from "sonner";

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export function CreateBranchModal({
  isOpen,
  onClose,
  companyId,
}: CreateBranchModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      companyService.createBranch({
        company_id: companyId,
        ...data,
      }),
    onSuccess: () => {
      toast.success("Branch created successfully");
      queryClient.invalidateQueries({ queryKey: ["branches", companyId] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create branch");
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      phone: "",
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Branch" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Branch Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Cabang Jakarta Timur"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g., Jl. Pulogadung Raya No. 123"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Jakarta"
              required
            />
          </div>

          <div>
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              placeholder="e.g., DKI Jakarta"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="e.g., 10220"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 021-12345678"
              required
            />
          </div>
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
            {createMutation.isPending ? "Creating..." : "Create Branch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
